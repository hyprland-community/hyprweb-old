import { ScopedRegistryHost } from "@lit-labs/scoped-registry-mixin";
import { LitElement, html, css } from "lit";
import { map } from "lit/directives/map.js";
import { deserialize } from "git-submodule-js";
import * as TOML from "@ltd/j-toml";
import { Task, TaskStatus } from "@lit-labs/task";
import init, { parse } from "https://unpkg.com/hyprparse-js/hyprparse_js.js";
import {
	WiredCard,
	WiredButton,
	WiredSpinner,
	WiredLink,
	WiredDialog,
	WiredIconButton,
} from "wired-elements";
import "@material/mwc-icon/mwc-icon.js";
import { sleep, spinner, params } from "./utils.js";

await init()

class Meta {
	constructor(name, desc, author) {
		this.name = name;
		this.desc = desc;
		this.author = author;
	}
}

export class ThemePreview extends LitElement {
	static properties = {
		url: params.String,
		name: params.String,
		meta: { type: Meta }
	};
	_apiTaskTheme = new Task(
		this,
		([url, name]) => {
			const regexp = /github\.com\/(?<owner>.*?)\/(?<repo>.*)/gm;
			const [, owner, repo] = [...url.matchAll(regexp)][0];


			let promise;
			promise = fetch(
				`https://raw.githubusercontent.com/${owner}/${repo}/master/${name}`
			)
				.then((d) => d.text())
				//.then(d => { console.log(d); return d })
				.then((d) => parse(d))
				.catch(() =>
				(promise = fetch(
					`https://raw.githubusercontent.com/${owner}/${repo}/master/${name}`
				)
					.then((d) => d.text())
					//.then(d => { console.log(d); return d })
					.then((d) => parse(d)))
				);
			return promise;
		},
		() => [this.url, this.name]
	);
	render() {
		return html`
			${this._apiTaskTheme.render({
			pending: () => spinner("loading theme preview"),
			complete: data => {
				console.log(data)
				let rgba = data.config.get("general:col.active_border")[0];
				let border_color = "";
				if (rgba.length !== 4) {
					border_color += `linear-gradient(${rgba[1]}deg, `;
					for (const i of rgba[0]) {
						console.log("thingy:", JSON.stringify(rgba[0]), "and:", i)
						border_color += `rgba(${i[0]}, ${i[1]}, ${i[2]}, ${i[3]}), `
					}
					border_color = border_color.substring(0, border_color.length - 2)
					border_color += ")"
				} else {
					border_color += `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${rgba[3]})`
				}

				return html`
					<style>
					@font-face {
						font-family: 'LondonBetween';
						src: url('fonts/LondonBetween.ttf') format('truetype');
					}

						.parent {
							background: #000;
							width: 192px;
							height: 108px;
							border-radius: 15px;
							display: flex; justify-content:center; align-items: center;
						}
						.window {
							background: #1b1b1b;
							font-family: 'LondonBetween';
							font-size: 7pt;
							background: black;
							width: 100%;
							height: 100%;
							scale: 98%;
							border-radius: calc(${data.config.get("decoration:rounding")[0]}px - 1px);
							color: white;
							text-align: left;
							position: absolute;
							margin: 0px;
							width: calc(100% - ${data.config.get("general:border_size")[0]}px);
        			height: calc(100% - ${data.config.get("general:border_size")[0]}px);
						}
						.border {
							width: 96px;
							height: 54px;
							background-color: #000;
							display: flex; justify-content:center; align-items: center;
							background: ${border_color};
							border-radius: ${data.config.get("decoration:rounding")[0]}px;
							position: relative;
						}
					</style>
					<div class="parent">
						<div class="border"><div class="window"><br />echo $name<br />${this.meta.name}</div></div>
					</div>
				`
			}
		})}
		`
	}
}

customElements.define("hypr-preview", ThemePreview)

export class Theme extends LitElement {
	static properties = {
		name: params.String,
		url: params.String,
	};

	static styles = css`
    * {
      --wired-icon-size: 14px;
    }
  `;

	_apiTask = new Task(
		this,
		([url]) => {
			const regexp = /github\.com\/(?<owner>.*?)\/(?<repo>.*)/gm;
			const [, owner, repo] = [...url.matchAll(regexp)][0];
			const addOwner = (obj) => {
				let newObj = obj;
				newObj.owner = owner;
				return newObj;
			};

			let promise;
			promise = fetch(
				`https://raw.githubusercontent.com/${owner}/${repo}/master/theme.toml`
			)
				.then((d) => d.text())
				.then((d) => TOML.parse(d))
				.then((d) => addOwner(d))
				.catch(() =>
					(promise = fetch(
						`https://raw.githubusercontent.com/${owner}/${repo}/main/theme.toml`
					)
						.then((d) => d.text())
						.then((d) => TOML.parse(d))).then((d) => addOwner(d))
				);
			return promise;
		},
		() => [this.url]
	);

	constructor() {
		super();
		this.name = null;
		this.url = null;
		//this.dialog = false;
	}

	showDialog() {
		this.renderRoot.querySelector("#dialog").open = true;
		console.log("Dialog opened");
	}
	hideDialog() {
		this.renderRoot.querySelector("#dialog").open = false;
		console.log("Dialog is closed");
	}

	render() {
		const author = (user, author) => html`<p>
      made by
      <wired-link href="https://github.com/${user}" target="_blank">
        ${author}
      </wired-link>
    </p>`;

		return html`
      ${this._apiTask.render({
			pending: () => spinner("Fetching theme data"),
			complete: (data) => {
				console.log(data);
				let installCmd = `hyprtheme install ${data.theme.name}`;
				return html`<wired-card>
							<hypr-preview url=${data.theme.git} name=${data.theme.config} .meta=${new Meta(data.theme.name, data.theme.desc, data.theme.author)}></hypr-preview>
              <h4>${data.theme.name}</h4>
              <p>${data.theme.desc}</p>
              ${author(data.owner, data.theme.author)}
              <p>version: ${data.theme.version}</p>
              <wired-button onclick="openPage('${this.url}')"
                >Go to repo</wired-button
              >
              <wired-button @click=${this.showDialog}>Install</wired-button>
            </wired-card>
            <wired-dialog id="dialog">
              <h3>Install theme:</h3>
              <p>To install copy this into your terminal:</p>
              <wired-card>
                <code>${installCmd}</code>
                <wired-icon-button
                  @click=${() => navigator.clipboard.writeText(installCmd)}
                >
                  <mwc-icon>content_copy</mwc-icon>
                </wired-icon-button>
              </wired-card>
              <br />
              <wired-button @click=${this.hideDialog}>Close</wired-button>
            </wired-dialog>`;
			},
		})}
    `;
	}
}

customElements.define("hypr-theme", Theme);

export class Themes extends ScopedRegistryHost(LitElement) {
	//static elementDefinition = {
	//  "hypr-theme": Theme,
	//};
	static styles = css`
    ul {
      list-style: none;
      display: grid;
      gap: 10px;
      grid-template-rows: masonry;
      grid-template-columns: repeat(3, minmax(10px, 1fr));
    }
  `;
	_themeListTask = new Task(
		this,
		async () =>
			fetch(
				"https://raw.githubusercontent.com/hyprland-community/theme-repo/main/.gitmodules"
			)
				.then((response) => response.text())
				.then((d) => deserialize(d)),
		() => []
	);

	genThemes(data) {
		return html`
      <ul>
        ${map(
			Object.entries(data),
			(item) => html`<li>
            <hypr-theme name="${item[0]}" url="${item[1].url}"></hypr-theme>
          </li>`
		)}
      </ul>
    `;
	}

	constructor() {
		super();
	}

	render() {
		return html`
      ${this._themeListTask.render({
			pending: () => spinner("Fetching themes ..."),
			complete: (data) => this.genThemes(data),
		})}
    `;
	}
}

// export class HyprConf extends LitElement {
// 	static properties = {
// 		conf: params.String
// 	};
// 	constructor() {
// 		super();
// 		this.conf = "placeholder=test"
// 	}
// 	render() {
// 		html`
// 			<p>${parse_hypr(this.conf)}</p>
// 		`
// 	}
// }
//customElements.define("hypr-themes", Themes);
