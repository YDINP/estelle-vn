import "./style.css";
import { mountGame } from "./game/ui";

// CSS에서 public 에셋을 base 경로(GitHub Pages 하위경로 등)와 무관하게 쓰도록
// custom property로 주입 (vite는 css 내 절대 url()에 base를 붙여주지 않음)
const base = import.meta.env.BASE_URL;
document.documentElement.style.setProperty("--u-title-cg", `url(${base}cg/lilia/title_hero.webp)`);
document.documentElement.style.setProperty("--u-panel", `url(${base}ui/panel.png)`);

const app = document.getElementById("app");
if (app) mountGame(app);
