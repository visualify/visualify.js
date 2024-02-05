import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkHtml from 'remark-html';

function Markdown({ props, style }) {
  const { path } = props;
  const [markdownContent, setMarkdownContent] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch the Markdown content from the specified path or file
    axios.get(path).then(
      (response) => {
        const markdown = response.data;

        // Create a new unified processor and use remark-parse and remark-html plugins
        unified()
          .use(remarkParse)
          .use(remarkHtml)
          .process(markdown, (err, file) => {
            if (err) {
              console.error('Error processing Markdown:', err);
              setError('Error processing Markdown');
            } else {
              // Set the HTML content to be rendered
              setMarkdownContent(String(file));
            }
          });
      },
      (error) => {
        console.error('Error fetching Markdown:', error);
        setError('Error fetching Markdown');
      }
    );
  }, [path]);

  if (error) {
    return (
      <div className='markdown-error' style={{ ...style }}>
        {error}
      </div>
    );
  }

  return (
    <div
      className='markdown-content'
      style={{ ...style }}
      dangerouslySetInnerHTML={{ __html: markdownContent }}
    />
  );
}

export default Markdown;
