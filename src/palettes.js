import { Color } from "three";

import * as THREE from "three";
THREE.ColorManagement.enabled = false

export const paletteList = ["black", "pink", "aquamarine", "blue", "darkblue", "grey", "white", "orange"]

export const palettes = {
  black: {
    "index": 0,
    "accentPalette": "black",
    "id": "black",
    "BG":             new Color("#100f10"),
    "BGLight":        new Color("#2a282a"),
    "text":           new Color("#b9bec2"),
    "highlightHover": new Color("#cccccc"),
    "inactive":       new Color("#6d6d6d"),
    "highlight":      new Color("#ffffff")
  },
  pink: {
    "index": 1,
    "accentPalette": "black",
    "id": "pink",
    "text":           new Color("#f0dede"),
    "inactive":       new Color("#e39393"),
    "BG":             new Color("#db7676"),
    "highlightHover": new Color("#f3c6c6"),
    "BGLight":        new Color("#d55f5f"),
    "highlight":      new Color("#ffffff")
  },
  aquamarine: {
    "index": 2,
    "accentPalette": "black",
    "id": "aquamarine",
    "BGLight":        new Color("#66a2a5"),
    "text":           new Color("#e0f1f1"),
    "highlightHover": new Color("#b5d6d8"),
    "inactive":       new Color("#56979b"),
    "BG":             new Color("#7fb9bc"),
    "highlight":      new Color("#ffffff")
  },
  blue: {
    "index": 3,
    "accentPalette": "black",
    "id": "blue",
    "BG":             new Color("#5963fa"),
    "BGLight":        new Color("#424bd3"),
    "highlight":      new Color("#f6f6f4"),
    "text":           new Color("#d2daf3"),
    "highlightHover": new Color("#c1c3e9"),
    "inactive":       new Color("#7b82e7")
  },
  darkblue:{
    "index": 4,
    "accentPalette": "black",
    "id": "darkblue",
    "BGLight":        new Color("#2c4570"),
    "BG":             new Color("#446091"),
    "text":           new Color("#a4b8db"),
    "highlightHover": new Color("#9fbae9"),
    "highlight":      new Color("#e7e6e4"),
    "inactive":       new Color("#6580ad")
  },
  grey: {
    "index": 5,
    "accentPalette": "white",
    "id": "grey",
    "inactive":       new Color("#7c8598"),
    "BG":             new Color("#ebebeb"),
    "BGLight":        new Color("#bcc2c9"),
    "highlight":      new Color("#122438"),
    "text":           new Color("#2a3e53"),
    "highlightHover": new Color("#3c526a")
  },
  white: {
    "index": 6,
    "accentPalette": "white",
    "id": "white",
    "BG":             new Color("#ffffff"),
    "BGLight":        new Color("#dfdfdf"),
    "text":           new Color("#3d3d3d"),
    "highlightHover": new Color("#333333"),
    "inactive":       new Color("#8d8d8d"),
    "highlight":      new Color("#000000"),
  },
  orange: {
    "index": 7,
    "accentPalette": "black",
    "id": "orange",
    "BG":             new Color("#f5e1ce"),
    "BGLight":        new Color("#f1d7c0"),
    "highlight":      new Color("#f04924"),
    "text":           new Color("#ff7657"),
    "highlightHover": new Color("#fd6e4e"),
    "inactive":       new Color("#ebaf92")
  }
}


export const sinPalettes = {
  black: {
    c0: new Color(0.5,0.5,0.5),
    c1: new Color(0.5,0.5,0.5),
    c2: new Color(1.0, 1.0, 1.0),
    c3: new Color(0.0, 0.33, 0.67),
    offset: 0.3
  },
  pink: {
    c0: new Color(1.6500000000000001, 0.55, 0.4),
    c1: new Color(0, 0.05, 0.15000000000000002),
    c2: new Color(0.30000000000000004, 0.2, 0.25),
    c3: new Color(0.75, 0.8, 0.8),
    offset: 0.3
  },
  aquamarine: {
    c0: new Color(0.4, 0.65, 0.2),
    c1: new Color(0.45, 0.45, 0.15000000000000002),
    c2: new Color(0.35000000000000003, 0.4, 1.9000000000000001),
    c3: new Color(0.30000000000000004, 0.15000000000000002, 1.1500000000000001),
    offset: 0.3
  },
  blue: {
    c0: new Color(0.8500000000000001, 0.9500000000000001, 0.4),
    c1: new Color(0.5, 0.5, 0.35000000000000003),
    c2: new Color(0.1, 0.5, 0.4),
    c3: new Color(0, 0, 0.8500000000000001),
    offset: 0.3
  },
  darkblue: {
    c0: new Color(0.65, 0.7000000000000001, 0.7000000000000001),
    c1: new Color(0.65, 0.6000000000000001, 0.6000000000000001),
    c2: new Color(0.9, 0.4, 0.30000000000000004),
    c3: new Color(0.9500000000000001, 0.45, 0.55),
    offset: 0.3
  },
  grey: {
    c0: new Color(0.2, 0.2, 0.2),
    c1: new Color(0.8, 0.8, 0.15000000000000002),
    c2: new Color(0.45, 0.4, 0),
    c3: new Color(0, 0, 0),
    offset: 1.2
  },
  white: {
    c0: new Color(0.35000000000000003, 0, 0.2),
    c1: new Color(1, 1, 1),
    c2: new Color(0.6000000000000001, 0.25, 0.30000000000000004),
    c3: new Color(0.6000000000000001, 0, 0),
    offset: 0.9
  },
  orange: {
    c0: new Color(0.45, 0, 0.2),
    c1: new Color(1, 0.55, 0),
    c2: new Color(0.4, 0.25, 0.30000000000000004),
    c3: new Color(0.6000000000000001, 0.8, 0),
    offset: 0.9
  },
};

