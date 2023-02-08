import { html } from "lit";
import { WiredSpinner } from "wired-elements";

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export const spinner = (msg) =>
	html`<wired-spinner spinning=""></wired-spinner><br />${msg} ...`;
export const title = title => document.title = title
export const params = {
	String: { type: String }
}
