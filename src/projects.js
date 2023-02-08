import { LitElement, html, css } from "lit";
import { Task, TaskStatus } from "@lit-labs/task";
import "@lit-labs/virtualizer";
import { ScopedRegistryHost } from "@lit-labs/scoped-registry-mixin";
import { Octokit } from "octokit";
import { WiredCard } from "wired-elements";
import { spinner } from "/utils.js";

const octokit = new Octokit({});
let [StringParam] = [{ type: String }];

class Repo extends LitElement {
	static properties = {
		name: StringParam,
		desc: StringParam,
		authors: { type: Array },
	};
	constructor() {
		super();
		this.name = "";
		this.desc = "";
		this.authors = [];
	}
	renderNew() {
		return html`
			<li>
      	<wired-card>
        	<h4>${this.name}</h4>
        	<p>${this.desc}</p>
        	<p>Maintained by ${this.authors.join(", ")}</p>
      	</wired-card>
			</li>
		`;
	}
	render() {
		let desc = this.desc.split("[maintainer")[0];
		let authors = [];
		if (this.desc.includes("maintainers")) {
			authors = this.desc
				.split("[maintainers=")[1]
				.split(",")
				.map((s) => s.replace("@", "").replace("]", ""));
		} else {
			authors.push(this.desc.split("[maintainer=@")[1].replace("]", ""));
		}
		if (authors === []) return html``;
		return html`
			<li>
      <wired-card>
        <h4>${this.name}</h4>
        <p>${desc}</p>
        <p>Maintained by ${authors.join(", ")}</p>
      </wired-card>
			</li>
		`;
	}
}

export class Repos extends ScopedRegistryHost(LitElement) {
	static elementDefinitions = {
		"hypr-repo": Repo,
	};
	static styles = css`
		ul {
      list-style: none;
      display: grid;
      gap: 10px;
      grid-template-rows: masonry;
      grid-template-columns: repeat(3, minmax(10px, 1fr));
    }
	`;
	_apiTask = new Task(
		this,
		async () => {
			let promise;
			promise = octokit
				.request("GET /orgs/{org}/repos{?type,sort,direction,per_page,page}", {
					org: "hyprland-community",
				})
				.then((d) => d.data);
			return promise;
		},
		() => []
	);
	renderItems(data) {
		return html` <lit-virtualizer
      scroller
      items=${JSON.stringify(data)}
      renderItem=${(item) =>
				html`<hypr-repo
          name="${item.name}"
          desc="${item.description}"
        ></hypr-repo>`}
    >
    </lit-virtualizer>`;
	}
	filterAndParseRepo(name, d) {
		let desc = d.split("[maintainer")[0];
		let authors = [];
		if (d.includes("maintainers")) {
			authors = d
				.split("[maintainers=")[1]
				.split(",")
				.map((s) => s.replace("@", "").replace("]", ""));
		} else {
			authors.push(d.split("[maintainer=@")[1].replace("]", ""));
		}
		if (authors === []) return null;
		return html`<hypr-repo name=${name} desc=${desc} .authors=${authors}></hypr-repo>`;
	}
	renderItemsOld(data) {
		return html`<ul>${data.map(
			(i) => //this.filterAndParseRepo(i.name, i.description)
				html`<hypr-repo name=${i.name} desc=${i.description}></hypr-repo>`
		)}</ul>`;
	}
	render() {
		return html`${this._apiTask.render({
			pending: () => spinner("Loading repositories"),
			// html`${JSON.stringify(d)}`
			complete: (d) => this.renderItemsOld(d),
		})}`;
	}
}
//customElements.define("hypr-repos", Repos);
