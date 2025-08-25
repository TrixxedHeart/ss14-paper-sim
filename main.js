// none of this is commented and is probably shitcode all the way through, if you plan to fuck around with this i am not responmsible for your medical expenses >:/
function sanitizeAndParseTags(input) {
	const tagRender = {
		bold:       c => `<span class="ss14-bold">${c}</span>`,
		italic:     c => `<span class="ss14-italic">${c}</span>`,
		bullet:     c => `<span class="ss14-bullet">&#8226; ${c}</span>`,
		color:      (c, v) => `<span class="ss14-color" style="color:${v};">${c}</span>`,
		head:       (c, v) => `<span class="ss14-head${v || 1}">${c}</span>`,
		size:       (c, v) => `<span class="ss14-size${v}">${c}</span>`,
		link:       c => `<span class="ss14-link">${c}</span>`,
		signature:  c => `<span class="ss14-signature">${c}</span>`
	};

	function escapeHTML(str) {
		return str.replace(/[&<>"']/g, c => ({
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#39;'
		}[c]))
	}

	function parse(str) {
		str = str.replaceAll(
			"\\\[", '');
		const tagStack = [];
		let output = '';
		let i = 0;

		while (i < str.length) {
			const open = str.indexOf('[', i);
			if (open === -1) {
				output += escapeHTML(str.slice(i));
				break;
			}
			output += escapeHTML(str.slice(i, open));
			const close = str.indexOf(']', open);
			if (close === -1) {
				output += escapeHTML(str.slice(open));
				break;
			}

			const raw = str.slice(open + 1, close);

			const isClosing = raw.startsWith('/');
			const [tag, val] = raw.replace(/^\//, '').split('=');
			const tagName = tag.trim().toLowerCase();
			const tagVal = val?.trim();

			if (isClosing) {
				let popped = null;
				while (tagStack.length > 0) {
					const last = tagStack.pop();
					if (last.name === tagName) {
						output += last.end;
						popped = last;
						break;
					} else {
						output += last.end;
					}
				}
				if (!popped) {
					output += escapeHTML(str.slice(open, close + 1));
				}
			} else {
				let htmlOpen = '', htmlClose = '';
				if (tagRender[tagName]) {
					htmlOpen = tagRender[tagName]('', tagVal).replace('></span>', '>');
					htmlClose = '</span>';
				}
				output += htmlOpen;
				tagStack.push({ name: tagName, end: htmlClose });
			}

			i = close + 1;
		}

		// close it if the bitch left it open!
		while (tagStack.length > 0) {
			output += tagStack.pop().end;
		}

		return output.replaceAll('', '[');
	}

	return parse(input);
}

const source = document.getElementById("source");
const preview = document.getElementById("preview");

function updatePreview() {
	const content = sanitizeAndParseTags(source.value.trim());

	preview.innerHTML = `
  <div class="paper-visual">
    <div class="paper-lines">${content || '<div class="blank-indicator">(This page is blank.)</div>'}</div>
    <div class="paper-stamps">
      <div class="stamp">Captain</div>
      <div class="stamp">NT</div>
    </div>
  </div>
`;
}


source.addEventListener("input", updatePreview);

source.value = `[color=#fc9d03]█▄ █[color=#ffb833]▀█▀[/color]⠀[head=2]Cargo Department[/head]
█ ▀█[color=#ffb833]   █ ⠀⠀[/color][head=3]Acquisition Request Receipt[/head]
[/color]‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
[color=#fc9d03][italic]"You’ll get your order when the gods of logistics deem you worthy."[/italic][/color]
This does [italic]not[/italic] guarantee effort, speed, or enthusiasm.

Requesting Party: 
Department:
Order Requested: 

Request Status:  
\\\[ ] Queued
\\\[ ] Actually Being Processed
\\\[ ] “Misplaced” (Check back never)
\\\[ ] We are taping this to our board to laugh at

Estimated Delivery Time:  
\\\[ ] Next 5 minutes or so (no guarantees)
\\\[ ] Sometime this shift
\\\[ ] We are experiencing delays out of our control, pray.

Handled By: your mom`;
updatePreview();
