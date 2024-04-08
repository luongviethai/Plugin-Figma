import { h as createEl } from "hastscript";


export const generate = (node:SceneNode) => {
    switch(node.type) {
        case 'FRAME':
            return createEl('div', {
                className: 'container'
            })
        }
}