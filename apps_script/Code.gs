/** Google Apps Script → GitHub bridge (JSON + Images)
 * Script Properties:
 *  - ADMIN_KEY
 *  - GITHUB_TOKEN
 *  - GH_REPO        e.g. "belchic05/nezhniy_online"
 *  - GH_BRANCH      e.g. "main"  (default)
 *  - GH_BASE_PATH   e.g. "nezhniy_online" (optional, без слэшей по краям)
 */

const ORIGIN_ALLOWLIST = [
  "https://belchic05.github.io",
  "https://belchic05.github.io/nezhniy_online"
];

function _corsHeaders_(origin){
  const allow = ORIGIN_ALLOWLIST.some(o => origin && origin.startsWith(o));
  return {
    "Access-Control-Allow-Origin": allow ? origin : ORIGIN_ALLOWLIST[0],
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
  };
}

function doOptions(e){
  const origin = (e && e.parameter && e.parameter.origin) || (e && e.headers && e.headers.origin);
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders(_corsHeaders_(origin));
}

function _prop(name, def){ const v = PropertiesService.getScriptProperties().getProperty(name); return v != null ? v : def; }

function _ghGetSha_(repo, branch, path, token){
  const url = "https://api.github.com/repos/" + repo + "/contents/" + encodeURIComponent(path) + "?ref=" + encodeURIComponent(branch);
  const resp = UrlFetchApp.fetch(url, { method:"get", muteHttpExceptions:true, headers: { "Authorization":"Bearer " + token, "Accept":"application/vnd.github+json" } });
  if (resp.getResponseCode() === 200){ return JSON.parse(resp.getContentText()).sha || null; }
  if (resp.getResponseCode() === 404){ return null; }
  throw new Error("GitHub GET failed: " + resp.getResponseCode() + " " + resp.getContentText());
}

function _ghPutFile_(repo, branch, path, contentB64, token, message){
  const url = "https://api.github.com/repos/" + repo + "/contents/" + encodeURIComponent(path);
  const sha = _ghGetSha_(repo, branch, path, token);
  const payload = { message: message || ("cms: update " + path), content: contentB64, branch: branch };
  if (sha) payload.sha = sha;
  const resp = UrlFetchApp.fetch(url, { method:"put", contentType:"application/json", muteHttpExceptions:true, headers:{ "Authorization":"Bearer " + token, "Accept":"application/vnd.github+json" }, payload: JSON.stringify(payload) });
  const code = resp.getResponseCode();
  if (code !== 200 && code !== 201){ throw new Error("GitHub PUT failed: " + code + " " + resp.getContentText()); }
  const j = JSON.parse(resp.getContentText());
  return (j && j.commit && j.commit.sha) || null;
}

function doPost(e){
  const origin = e && e.headers && e.headers.origin;
  const headers = _corsHeaders_(origin);

  try{
    const body = JSON.parse(e.postData.contents || "{}");
    const ADMIN_KEY = _prop("ADMIN_KEY");
    const TOKEN = _prop("GITHUB_TOKEN");
    const REPO = _prop("GH_REPO");
    const BRANCH = _prop("GH_BRANCH", "main");
    const BASE = _prop("GH_BASE_PATH", "").replace(/^\\/+|\\/+$/g, "");

    if (!body || !body.adminKey || body.adminKey !== ADMIN_KEY){
      throw new Error("Forbidden: неверный adminKey");
    }
    if (!TOKEN || !REPO){ throw new Error("GITHUB_TOKEN или GH_REPO не заданы в Script Properties"); }

    const commit = body.commit || null;
    const result = { ok:true, items:[] };

    // 1) JSON-файл (если передан)
    if (body.path && typeof body.content === "string"){
      const targetPath = (BASE ? BASE + "/" : "") + body.path.replace(/^\\/+/, "");
      const bytes = Utilities.newBlob(body.content, "application/json").getBytes();
      const b64 = Utilities.base64Encode(bytes);
      const sha = _ghPutFile_(REPO, BRANCH, targetPath, b64, TOKEN, commit || ("cms: update " + targetPath));
      result.items.push({ path: targetPath, commitSha: sha });
      result.commitSha = sha;
    }

    // 2) Загрузки изображений (если переданы)
    if (Array.isArray(body.uploads) && body.uploads.length){
      body.uploads.forEach(u => {
        var targetPath = (BASE ? BASE + "/" : "") + String(u.path || "").replace(/^\\/+/, "");
        if (!u.content_b64) throw new Error("uploads[].content_b64 is required");
        var sha = _ghPutFile_(REPO, BRANCH, targetPath, u.content_b64, TOKEN, commit || ("cms: upload " + targetPath));
        result.items.push({ path: targetPath, commitSha: sha });
      });
    }

    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON).setHeaders(headers);
  }catch(err){
    return ContentService.createTextOutput(JSON.stringify({ ok:false, error:String(err) })).setMimeType(ContentService.MimeType.JSON).setHeaders(headers);
  }
}
