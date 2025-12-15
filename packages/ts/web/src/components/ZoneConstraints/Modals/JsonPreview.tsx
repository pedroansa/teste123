import { useMemo } from 'react';

interface JsonPreviewProps {
  data: any;
  className?: string;
}

export function JsonPreview({ data, className = '' }: JsonPreviewProps) {
  const formattedJson = useMemo(() => {
    if (!data) return null;
    
    try {
      const json = JSON.stringify(data, null, 2);
      return syntaxHighlight(json);
    } catch {
      return null;
    }
  }, [data]);

  if (!formattedJson) {
    return (
      <div className={`json-preview min-h-[200px] flex items-center justify-center ${className}`}>
        <span className="text-muted-foreground text-sm">
          Preencha o formulário para ver o JSON
        </span>
      </div>
    );
  }

  return (
    <pre 
      className={`json-preview min-h-[200px] max-h-[600px] ${className}`}
      dangerouslySetInnerHTML={{ __html: formattedJson }}
    />
  );
}

function syntaxHighlight(json: string): string {
  // Escape HTML
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      let cls = 'number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'key';
        } else {
          cls = 'string';
        }
      } else if (/true|false/.test(match)) {
        cls = 'boolean';
      } else if (/null/.test(match)) {
        cls = 'null';
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
}
