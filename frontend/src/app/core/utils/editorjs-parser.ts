export interface EditorJsBlock {
  type: string;
  data: any;
}

export interface ParsedEditorJs {
  blocks: EditorJsBlock[];
}

function decode(str: string): string {
  const txt = document.createElement('textarea');
  txt.innerHTML = str;
  return txt.value;
}

export function parseEditorJsContent(content: string): ParsedEditorJs {
  try {
    const parsed = JSON.parse(content);
    const blocks: EditorJsBlock[] = Array.isArray(parsed)
      ? parsed
      : parsed?.blocks ?? [];

    // Decode text in each block
    return {
      blocks: blocks.map(block => ({
        ...block,
        data: {
          ...block.data,
          text: block.data?.text ? decode(block.data.text) : block.data?.text
        }
      }))
    };
  } catch (e) {
    console.error('Error parsing EditorJS content', e);
    return { blocks: [] };
  }
}
