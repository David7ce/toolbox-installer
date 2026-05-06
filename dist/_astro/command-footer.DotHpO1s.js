function c({ariaLabel:o="Install command",commandLabel:t="Install command:",hasLangId:e=!1,initialText:n="Select packages to generate install command..."}={}){const a=document.createElement("div");a.className="command-footer",a.id="commandFooter",a.hidden=!0,a.setAttribute("role","region"),a.setAttribute("aria-label",o);const d=e?' id="commandLanguage"':"";return a.innerHTML=`
        <div class="command-container">
            <div class="command-output">
                <div class="command-header">
                    <span class="command-language"${d}>${t}</span>
                    <button type="button" class="copy-btn" id="copyCommandBtn"
                        title="Copy to clipboard" aria-label="Copy to clipboard">📋 Copy</button>
                </div>
                <code id="installation-command" aria-live="polite">${n}</code>
            </div>
        </div>`,document.body.appendChild(a),a}export{c};
