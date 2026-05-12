import React from "react";
import { createRoot } from "react-dom/client";
import Popup from "~/popup";
import "~/src/styles/popup.css";

const container = document.getElementById("app")!;
createRoot(container).render(<Popup />);
