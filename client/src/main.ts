import "./style.css";
import { Application } from "./app/Application";

const appElement = document.getElementById("app");

if (appElement) {
  new Application(appElement);
}
