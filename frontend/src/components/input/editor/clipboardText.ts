import type {Node as ProseMirrorNode, Slice} from '@tiptap/pm/model'

// Plain-text copy keeps list structure: a copied bullet list should come out as
// "- item" lines rather than the bare paragraph text ProseMirror emits by default.
const LIST_TYPES = new Set(['bulletList', 'orderedList', 'taskList'])

function listItemLines(item: ProseMirrorNode, marker: string): string[] {
	const body: string[] = []
	item.forEach(child => body.push(...blockLines(child)))

	if (body.length === 0) {
		return [marker.trimEnd()]
	}

	const indent = ' '.repeat(marker.length)
	return body.map((line, index) => (index === 0 ? marker : indent) + line)
}

function blockLines(node: ProseMirrorNode): string[] {
	if (node.isText) {
		return [node.text ?? '']
	}

	if (LIST_TYPES.has(node.type.name)) {
		const ordered = node.type.name === 'orderedList'
		const lines: string[] = []
		node.forEach((item, _offset, index) => {
			lines.push(...listItemLines(item, ordered ? `${index + 1}. ` : '- '))
		})
		return lines
	}

	if (node.isTextblock) {
		return [node.textContent]
	}

	const lines: string[] = []
	node.forEach(child => lines.push(...blockLines(child)))
	return lines
}

export function sliceToPlainText(slice: Slice): string {
	const blocks: string[] = []
	slice.content.forEach(node => {
		const lines = blockLines(node)
		if (lines.length > 0) {
			blocks.push(lines.join('\n'))
		}
	})
	return blocks.join('\n\n')
}
