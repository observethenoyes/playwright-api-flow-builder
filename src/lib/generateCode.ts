// src/lib/generatePlaywrightTest.ts

export interface Step {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  expectStatusOk?: boolean;
  expectArrayNotEmpty?: boolean;
  saveResponseAs?: string;
  requestBody?: string;
  headers?: Record<string, string>;
  baseUrl?: string;
}

export function generatePlaywrightTest(steps: Step[]): string {
  // Get baseUrl from first step, fallback to default
  const baseUrl = steps.length > 0 && steps[0].baseUrl 
    ? steps[0].baseUrl 
    : "https://api.example.com";

  const lines: string[] = [
    `import { test, expect } from '@playwright/test';`,
    ``,
    `const baseUrl = "${baseUrl}";`,
    ``,
    `test("Generated API test", async ({ request }) => {`,
  ];

  steps.forEach((step, idx) => {
    // Create a more concise step description
    let stepDesc = `${step.method}`;
    if (step.saveResponseAs) {
      stepDesc += ` and save as ${step.saveResponseAs}`;
    } else {
      stepDesc += ` request`;
    }
    
    const testStepVar = step.saveResponseAs || `data${idx + 1}`;

    // build the final URL string
    const finalUrl = step.url.startsWith('http') 
      ? `\`${step.url}\`` 
      : `\`\${baseUrl}${step.url.startsWith('/') ? step.url : '/' + step.url}\``;

    // If they want to "saveResponseAs" this response, we prefix with `const X = await test.step(...)`.
    // Otherwise, we just do an `await test.step(...)`.
    const assignmentPrefix = step.saveResponseAs ? `const ${testStepVar} = ` : '';

    lines.push(`  ${assignmentPrefix}await test.step("${stepDesc}", async () => {`);
    // Build request options
    const requestOptions = [];
    if (step.requestBody && (step.method === 'POST' || step.method === 'PUT')) {
      // Handle template literals in request body
      if (step.requestBody.includes('${')) {
        // If contains template literals, wrap in backticks and escape properly
        const bodyWithTemplates = step.requestBody.replace(/"/g, '\\"');
        // Format with proper indentation
        const formattedBody = bodyWithTemplates
          .split('\n')
          .map((line, index) => index === 0 ? line : `        ${line}`)
          .join('\n');
        requestOptions.push(`data: \`${formattedBody}\``);
      } else {
        // Format JSON with proper indentation
        try {
          const parsed = JSON.parse(step.requestBody);
          const formatted = JSON.stringify(parsed, null, 2).replace(/^/gm, '      ');
          requestOptions.push(`data: ${formatted}`);
        } catch {
          // If not valid JSON, use as-is with basic formatting
          requestOptions.push(`data: ${step.requestBody}`);
        }
      }
    }
    if (step.headers && Object.keys(step.headers).length > 0) {
      const headersObj: Record<string, string> = {};
      
      // Process headers to handle template literals properly
      Object.entries(step.headers).forEach(([key, value]) => {
        // If value contains ${...}, it needs to be a template literal
        if (value.includes('${')) {
          headersObj[key] = `\`${value}\``;
        } else {
          headersObj[key] = `"${value}"`;
        }
      });
      
      const headersEntries = Object.entries(headersObj)
        .map(([key, value]) => `        "${key}": ${value}`)
        .join(',\n');
      
      requestOptions.push(`headers: {\n${headersEntries}\n      }`);
    }
    
    const optionsStr = requestOptions.length > 0 ? `, {\n      ${requestOptions.join(',\n      ')}\n    }` : '';
    lines.push(`    const response = await request.${step.method.toLowerCase()}(${finalUrl}${optionsStr});`);

    if (step.expectStatusOk) {
      lines.push(`    await expect(response).toBeOK();`);
    }

    lines.push(`    const data = await response.json();`);

    if (step.expectArrayNotEmpty) {
      lines.push(`    expect(data.length).toBeGreaterThan(0);`);
    }

    // Return entire response data if we want to chain it
    if (step.saveResponseAs) {
      lines.push(`    return data;`);
    }

    lines.push(`  });`);
    lines.push('');
  });

  lines.push('});');

  return lines.join('\n');
}
