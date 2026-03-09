(function() {
    if (window.__snifferLoaded) return;
    window.__snifferLoaded = true;
    window.__reqs = [];
    window.__cur = null;

    function J(t) {
        try { return JSON.stringify(JSON.parse(t), null, 2); }
        catch(e) { return t; }
    }

    function UI() {
        if (document.getElementById("__sniffer")) return;

        let p = document.createElement("div");
        p.id = "__sniffer";
        p.style = "position:fixed;bottom:0;left:0;width:100vw;height:70vh;background:#0d1117;color:#fff;border-radius:10px 10px 0 0;box-shadow:0 0 10px #000;z-index:999999;display:none;flex-direction:column;overflow:scroll;";
        p.innerHTML = `
        <div id="sDrag" style="padding:10px;background:#161b22;font-weight:bold;display:flex;justify-content:space-between;align-items:center;cursor:move;position:sticky;top:0;height:45px">
            Agent DevTool
            <button id="sCopy" style="background:#303030;border:none;color:#fff;padding:4px 10px;border-radius:6px;cursor:pointer">Copy</button>
        </div>
        <div style="display:flex;border-bottom:1px solid #30363d;position:sticky;top:44px;width:100%;background-color:#0D1117;">
            <div id="sTab1" style="padding:6px 10px;cursor:pointer;border-bottom:2px solid #58a6ff;">Network</div>
            <div id="sTab2" style="padding:6px 10px;cursor:pointer">Response</div>
            <div id="sTab3" style="padding:6px 10px;cursor:pointer">Storage</div>
            
        </div>
        <div id="sList" style="flex:1;overflow:scroll;overflow-x:scroll;white-space:nowrap;-webkit-overflow-scrolling:touch"></div>
        <div id="sReq" style="flex:1;display:none;flex-direction:column">
            <div style="display:flex;border-bottom:1px solid #30363d;width:100%;height:30px;position:sticky;top:77px;background-color:#0D1117;">
                <div class="st" data="response" style="padding:6px;color:#fff;cursor:pointer;width:20%;display:flex;justify-content:center;align-items:center;">Response</div>
                <div class="st" data="curl" style="padding:6px;color:#fff;cursor:pointer;width:20%;display:flex;justify-content:center;align-items:center;">Curl</div>
                <div class="st" data="js" style="padding:6px;color:#fff;cursor:pointer;width:20%;display:flex;justify-content:center;align-items:center;">JavaScript</div>
                <div class="st" data="node" style="padding:6px;color:#fff;cursor:pointer;width:20%;display:flex;justify-content:center;align-items:center;">NodeJS</div>
                <div class="st" data="python" style="padding:6px;color:#fff;cursor:pointer;width:20%;display:flex;justify-content:center;align-items:center;">Python</div>
            </div>
            <pre id="sBox" style="flex:1;margin:0;padding:10px;overflow:scroll;color:#fff;"></pre>
        </div>
        `;
        document.documentElement.appendChild(p);

        let sTab1 = document.getElementById("sTab1");
        let sTab2 = document.getElementById("sTab2");
        let sList = document.getElementById("sList");
        let sReq = document.getElementById("sReq");

        sTab1.onclick = function() { sList.style.display="block"; sReq.style.display="none"; sTab1.style.borderBottom="2px solid #58a6ff"; sTab2.style.border="none"; }
        sTab2.onclick = function() { sList.style.display="none"; sReq.style.display="flex"; sTab2.style.borderBottom="2px solid #58a6ff"; sTab1.style.border="none"; }

        document.querySelectorAll(".st").forEach(e=>{ e.onclick=()=>show(e.getAttribute("data")); });

        document.getElementById("sCopy").onclick = function() {
            let t = document.getElementById("sBox").textContent;
            navigator.clipboard.writeText(t);
            this.innerText = "✓ Copied";
            setTimeout(()=>{this.innerText="Copy"},1200);
        }

        // Drag
        let drag=false,dx=0,dy=0;
        let bar=document.getElementById("sDrag");
        bar.addEventListener("mousedown", e=>{ drag=true; dx=e.clientX-p.offsetLeft; dy=e.clientY-p.offsetTop; });
        document.addEventListener("mousemove", e=>{ if(!drag) return; p.style.left=e.clientX-dx+"px"; p.style.top=e.clientY-dy+"px"; p.style.bottom="auto"; });
        document.addEventListener("mouseup", ()=>drag=false);
    }
    
    function formateStatusCode(status) {
    let color = '';
    
     if (status >= 200 && status < 300) {
            color = 'green'; // Success
        } else if (status >= 300 && status < 400) {
            color = 'orange'; // Redirect
        } else if (status >= 400 && status < 500) {
            color = 'red'; // Client Error
        } else if (status >= 500 && status <= 500) {
            color = 'darkred'; // Server Error
        } else {
            color = 'gray'; // Unknown
        }
    
        return `<span style="color:${color}" class="status">${status}</span>`;
    }

    function render() {
        UI();
        let l=document.getElementById("sList");
        if(!l) return;
        l.innerHTML="";
        window.__reqs.forEach(r=>{
            let d=document.createElement("div");
            d.style="padding:6px;border-bottom:1px solid #30363d;cursor:pointer";
            d.innerHTML=`<div class="rq-info" style="display: flex;font-size: 12px;align-items: center;justify-content: space-between;"><span class="method">${r.method}</span>${formateStatusCode(r.status)}<span class="time">${r.time/1000}s</span><span class="size">${r.size} Bytes</span></div><div class="re-url" style="color: #808080;overflow-x: hidden;display: flex;justify-content: flex-start;;font-size: 18px;height: 20px">${r.url}</div>`;
            d.onclick=()=>{ window.__cur=r; document.getElementById("sTab2").click(); show("response"); }
            l.appendChild(d);
        });
    }

    function show(t) {
        if(!window.__cur) return;
        let r=window.__cur;
        let b=document.getElementById("sBox");
        if(t=="response") b.textContent=J(r.res);
        if(t=="curl"){
            let h="";
            for(let k in r.h) h+='\n -H "'+k+": "+r.h[k]+'" \\';
            b.textContent = `curl -X ${r.method} "${r.url}" \\${h}${r.body ? "\n -d '" + r.body + "'" : ""}`;
        }
        if(t=="js") b.textContent=`fetch("${r.url}",{method:"${r.method}",headers:${JSON.stringify(r.h,null,2)}${r.body?',body:'+JSON.stringify(r.body,null,2):''}}).then(r=>r.text()).then(console.log)`;
        if(t=="node") b.textContent=`const fetch=require("node-fetch");fetch("${r.url}",{method:"${r.method}",headers:${JSON.stringify(r.h,null,2)}${r.body?',body:'+JSON.stringify(r.body,null,2):''}}).then(r=>r.text()).then(console.log)`;
        if(t=="python") b.textContent=`import requests\nurl="${r.url}"\nheaders=${JSON.stringify(r.h,null,2)}${r.body?'\ndata='+JSON.stringify(r.body,null,2):''}\nr=requests.${r.method.toLowerCase()}(url,headers=headers${r.body?',data=data':''})\nprint(r.text)`;
    }

    // Sniffer icon
    let icon=document.createElement("div");
    icon.id="__snifferIcon";
    icon.style="position:fixed;top:20px;right:20px;width:52px;height:52px;background:#222;border-radius:50%;display:flex;align-items:center;justify-content:center;z-index:99999999;box-shadow:0 4px 10px #000";
    icon.innerHTML='<svg width=26 height=26 viewBox="0 0 24 24" fill=white><path d="M21 16v2a2 2 0 0 1-2 2h-2l-3 3-3-3H5a2 2 0 0 1-2-2v-2h18z"/><circle cx=12 cy=8 r=3 /></svg>';
    document.documentElement.appendChild(icon);
    icon.onclick=function(){ UI(); let p=document.getElementById("__sniffer"); if(!p) return; p.style.display=p.style.display=="flex"?"none":"flex"; }

    // Hook fetch
    const _f = window.fetch;
    window.fetch = async function(url,options={}) {
        let m=options.method||"GET", h=options.headers||{}, b=options.body||null;
        const start = performance.now();
        let r = await _f.apply(this,arguments);
        const end = performance.now();
        let duration = Math.round(end - start);
        
        let c = r.clone();
        c.text().then(t=>{
            let bts = r.headers.get("content-length") || t.length;
            window.__reqs.push({method:m,url,status:r.status,h:h,res:t,body:b,time:duration,size:bts});
            render();
        });
        return r;
    }

    // Hook XHR
    const _o=XMLHttpRequest.prototype.open, _s=XMLHttpRequest.prototype.send, _sh=XMLHttpRequest.prototype.setRequestHeader;
    XMLHttpRequest.prototype.open=function(m,u){ this._m=m; this._u=u; this._h={}; return _o.apply(this,arguments); }
    XMLHttpRequest.prototype.setRequestHeader=function(k,v){ this._h[k]=v; return _sh.apply(this,arguments); }
    XMLHttpRequest.prototype.send=function(b){ const start = performance.now();this._body=b; this.addEventListener("load",()=>{const end = performance.now();const duration = Math.round(end - start);let bts = this.getResponseHeader("content-length") || this.responseText.length;window.__reqs.push({method:this._m,url:this._u,status:this.status,h:this._h,res:this.responseText,body:this._body,size:bts,time:duration}); render(); }); return _s.apply(this,arguments); }

})();
