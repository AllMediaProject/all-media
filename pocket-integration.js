<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>All Media — Restore + Fix AUD-003</title>
<style>
:root{--bg:#101a3a;--card:#182447;--peach:#ffc384;--text:#f8f8f2;--muted:#aeb7cb}
*{box-sizing:border-box}
body{margin:0;min-height:100vh;padding:28px;background:var(--bg);color:var(--text);font-family:Arial,sans-serif}
main{width:min(720px,100%);margin:auto;padding:24px;border:1px solid rgba(255,195,132,.35);border-radius:18px;background:var(--card)}
h1{margin:0 0 10px}
p{line-height:1.55;color:var(--muted)}
.notice{margin:18px 0;padding:15px;border:1px solid rgba(255,195,132,.22);border-radius:12px;background:rgba(0,0,0,.14)}
button{width:100%;padding:14px;border:0;border-radius:11px;background:var(--peach);color:var(--bg);font-weight:800;font-size:15px;cursor:pointer}
button:disabled{opacity:.55}
#status{margin-top:16px;white-space:pre-wrap;font:12px/1.6 monospace;color:var(--muted)}
code{color:var(--peach)}
</style>
</head>
<body>
<main>
<h1>Restore pocket-integration.js + fix AUD-003</h1>
<p>This restores the last known-good Pocket integration file and adds the tiny creator-icon removal.</p>

<div class="notice">
<strong>Important:</strong><br>
Do <em>not</em> upload this HTML file to GitHub.<br><br>
Click the button below. It will download a second file named:<br>
<code>pocket-integration-FIXED.txt</code>
</div>

<button id="go">Download the corrected Pocket file</button>
<div id="status">Ready.</div>
</main>

<script>
(() => {
  const GOOD =
    "https://raw.githubusercontent.com/AllMediaProject/all-media/0ce62b7840719e59e3b44f3fcc7427a6c49b96c0/pocket-integration.js";

  const ANCHOR =
    "      .feed .post .pocket-action.pocketed{border-color:#ffc384!important;background:rgba(255,195,132,.11)!important;color:#ffc384!important}\\n";

  const RULE =
    "      .pockets-panel .pocket-creator-avatar:not(.large){display:none!important}\\n";

  const button = document.getElementById("go");
  const status = document.getElementById("status");

  button.onclick = async () => {
    button.disabled = true;
    status.textContent = "Fetching the last known-good pocket-integration.js…";

    try{
      const res = await fetch(GOOD + "?restore=" + Date.now(), {cache:"no-store"});
      if(!res.ok) throw new Error("GitHub returned HTTP " + res.status);

      let source = await res.text();

      if(!source.trim().startsWith("(() => {")){
        throw new Error("Safety check failed: fetched file is not the expected JavaScript.");
      }

      if(!source.includes(RULE)){
        if(!source.includes(ANCHOR)){
          throw new Error("Safety check failed: patch anchor was not found.");
        }
        source = source.replace(ANCHOR, ANCHOR + RULE);
      }

      if(source.includes("<!doctype html>")){
        throw new Error("Safety check failed: HTML was detected inside the JavaScript.");
      }

      const blob = new Blob([source], {type:"text/plain;charset=utf-8"});
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "pocket-integration-FIXED.txt";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(()=>URL.revokeObjectURL(url),1500);

      status.textContent =
        "✓ Corrected file downloaded.\n\n" +
        "NEXT:\n" +
        "1. Rename pocket-integration-FIXED.txt to pocket-integration.js\n" +
        "2. Upload THAT file to the repo root\n" +
        "3. Replace the current pocket-integration.js\n" +
        "4. Commit: Restore Pocket integration and fix AUD-003";
    }catch(err){
      console.error(err);
      status.textContent =
        "ERROR: " + err.message +
        "\n\nNothing was changed on GitHub.";
    }finally{
      button.disabled = false;
    }
  };
})();
</script>
</body>
</html>
