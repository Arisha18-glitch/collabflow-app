import { Extension } from '@tiptap/core';

export const BorderExtension = Extension.create({
    name: 'borderExtension',

    addGlobalAttributes() {
        return [
            {
                types: ['paragraph', 'heading'],
                attributes: {
                    border: {
                        default: false,
                        parseHTML: element => element.hasAttribute('data-border'),
                        renderHTML: attributes => {
                            if (!attributes.border) {
                                return {};
                            }
                            return { 'data-border': 'true', class: 'has-border' };
                        },
                    },
                },
            },
        ];
    },

    addCommands() {
        return {
            toggleBorder: () => ({ commands, editor }) => {
                const { selection } = editor.state;
                if (!selection) return false;

                const node = selection.$anchor.parent;
                if (!node) return false;

                const currentBorder = node.attrs.border;
                const newBorder = !currentBorder;

                // Attempt to update on supported block nodes
                const successPara = commands.updateAttributes('paragraph', { border: newBorder });
                const successHead = commands.updateAttributes('heading', { border: newBorder });
                
                return successPara || successHead;
            },
        };
    },
});
