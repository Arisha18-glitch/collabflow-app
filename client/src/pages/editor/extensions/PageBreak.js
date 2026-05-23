import { Node, mergeAttributes } from '@tiptap/core';

export const PageBreak = Node.create({
    name: 'pageBreak',
    group: 'block',
    parseHTML() {
        return [{ tag: 'hr.page-break' }, { tag: 'div.page-break' }];
    },
    renderHTML({ HTMLAttributes }) {
        return ['hr', mergeAttributes(HTMLAttributes, { class: 'page-break' })];
    },
    addCommands() {
        return {
            setPageBreak: () => ({ chain }) => {
                return chain().insertContent({ type: this.name }).run();
            },
        };
    },
});
