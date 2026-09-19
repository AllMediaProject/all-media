<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>All Media — AUD-003 Fix Builder</title>
<style>
:root{--bg:#101a3a;--card:#182447;--deep:#111b3b;--peach:#ffc384;--text:#f8f8f2;--muted:#aeb7cb;--line:rgba(255,255,255,.10)}
*{box-sizing:border-box}
body{margin:0;min-height:100vh;padding:28px;background:var(--bg);color:var(--text);font-family:Arial,sans-serif}
main{width:min(720px,100%);margin:0 auto;padding:24px;border:1px solid rgba(255,195,132,.35);border-radius:18px;background:var(--card)}
h1{margin:0 0 8px;font-size:25px}
p{color:var(--muted);line-height:1.55}
.box{margin:18px 0;padding:15px;border:1px solid var(--line);border-radius:12px;background:var(--deep)}
button{width:100%;padding:14px 18px;border:1px solid var(--peach);border-radius:11px;background:var(--peach);color:var(--bg);font-weight:800;font-size:15px;cursor:pointer}
button:disabled{opacity:.55;cursor:wait}
#status{white-space:pre-wrap;font-family:monospace;font-size:12px;line-height:1.6}
code{color:var(--peach)}
</style>
</head>
<body>
<main>
<h1>AUD-003 · Pocket creator-icon cleanup</h1>
<p>This builds a replacement <code>pocket-integration.js</code> from the current GitHub version and changes only one thing: compact creator avatars in Pocket rows are hidden. Larger creator identity avatars in More Pockets remain untouched.</p>
<div class="box"><strong>Your GitHub repo is not edited by this file.</strong><p>It only reads the current file and downloads the corrected replacement to your Chromebook.</p></div>
<button id="build" type="button">Build AUD-003 Replacement</button>
<div class="box"><div id="status">Ready.</div></div>
</main>

<script>
(() => {
  const RAW = "https://raw.githubusercontent.com/AllMediaProject/all-media/main/pocket-integration.js";
  const RULE = "      .pockets-panel .pocket-creator-avatar:not(.large){display:none!important}\\n";
  const ANCHOR = "      .feed .post .pocket-action.pocketed{border-color:#ffc384!important;background:rgba(255,195,132,.11)!important;color:#ffc384!important}\\n";
  const status = document.getElementById("status");
  const button = document.getElementById("build");

  function log(msg){status.textContent += "\\n" + msg}

  button.addEventListener("click", async () => {
    button.disabled = true;
    status.textContent = "Fetching current pocket-integration.js from GitHub…";

    try{
      const res = await fetch(RAW + "?aud003=" + Date.now(), {cache:"no-store"});
      if(!res.ok) throw new Error("GitHub returned HTTP " + res.status);

      let source = await res.text();

      if(source.includes(".pocket-creator-avatar:not(.large)")){
        log("✓ AUD-003 rule is already present. Downloading current file.");
      } else {
        if(!source.includes(ANCHOR)){
          throw new Error("Safety check failed: expected style anchor was not found. No replacement was created.");
        }
        source = source.replace(ANCHOR, ANCHOR + RULE);
        log("✓ Added compact creator-avatar cleanup rule.");
      }

      const blob = new Blob([source], {type:"text/javascript;charset=utf-8"});
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "pocket-integration.js";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);

      log("✓ DONE");
      log("Upload pocket-integration.js to the root of your GitHub repo and replace the existing file.");
      log("Commit message: Fix AUD-003 Pocket creator icon");
    } catch(err) {
      console.error(err);
      log("ERROR: " + err.message);
      log("Nothing was changed on GitHub.");
    } finally {
      button.disabled = false;
    }
  });
})();
</script>
</body>
</html>
