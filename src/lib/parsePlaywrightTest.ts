import { Step } from './generateCode';

export function parsePlaywrightTest(testContent: string): Step[] {
  console.log('parsePlaywrightTest called with content length:', testContent.length);
  const steps: Step[] = [];
  
  // Extract base URL
  const baseUrlMatch = testContent.match(/const\s+baseUrl\s*=\s*["'`]([^"'`]+)["'`]/);
  const baseUrl = baseUrlMatch ? baseUrlMatch[1] : 'https://api.example.com';
  console.log('Extracted base URL:', baseUrl);
  
  // Find all test.step blocks
  const testStepRegex = /await\s+test\.step\s*\(\s*["'`]([^"'`]+)["'`]\s*,\s*async\s*\(\)\s*=>\s*\{([\s\S]*?)\}\s*\)/g;
  let match;
  let stepCount = 0;
  
  while ((match = testStepRegex.exec(testContent)) !== null) {
    stepCount++;
    const stepDescription = match[1];
    const stepBody = match[2];
    console.log(`Found test step ${stepCount}:`, { stepDescription, bodyLength: stepBody.length });
    
    // Parse the step body to extract API call details
    const step = parseStepBody(stepBody, stepDescription, baseUrl);
    console.log(`Parsed step ${stepCount}:`, step);
    if (step) {
      steps.push(step);
    }
  }
  
  console.log(`Total steps found: ${stepCount}, valid steps: ${steps.length}`);
  return steps;
}

function parseStepBody(stepBody: string, stepDescription: string, baseUrl: string): Step | null {
  console.log('parseStepBody called with:', { stepBody, stepDescription });
  
  // First try to extract method and URL
  const methodMatch = stepBody.match(/request\.(\w+)\s*\(/);
  const urlMatch = stepBody.match(/`([^`]+)`/);
  
  if (!methodMatch || !urlMatch) {
    console.log('Could not find method or URL');
    return null;
  }
  
  // Extract complete options block using balanced brace counting
  const requestStart = stepBody.indexOf('request.');
  const firstBrace = stepBody.indexOf('{', requestStart);
  
  let optionsBlock = '';
  if (firstBrace !== -1) {
    let braceCount = 0;
    let i = firstBrace;
    const start = firstBrace + 1;
    
    // Find matching closing brace
    while (i < stepBody.length) {
      if (stepBody[i] === '{') braceCount++;
      else if (stepBody[i] === '}') braceCount--;
      
      if (braceCount === 0) {
        optionsBlock = stepBody.substring(start, i);
        break;
      }
      i++;
    }
  }
  
  const method = methodMatch[1];
  const fullUrl = urlMatch[1];
  
  console.log('Balanced brace extraction:', { method, fullUrl, optionsBlock: optionsBlock.substring(0, 100) + '...' });
  return parseStepData(method, fullUrl, optionsBlock, stepDescription, baseUrl, stepBody);
}

function parseStepData(method: string, fullUrl: string, optionsBlock: string, stepDescription: string, baseUrl: string, stepBody: string): Step {
  // Extract URL (remove baseUrl if present)
  let url = fullUrl;
  if (fullUrl.includes('${baseUrl}')) {
    url = fullUrl.replace(/\$\{baseUrl\}/g, '');
  }
  // Clean up the URL
  if (!url.startsWith('/') && url.length > 0) {
    url = '/' + url;
  }
  
  // Parse headers
  const headers: Record<string, string> = {};
  const headersMatch = optionsBlock.match(/headers:\s*\{([\s\S]*?)\}/);
  console.log('Headers match:', headersMatch);
  
  if (headersMatch) {
    const headersContent = headersMatch[1];
    console.log('Headers content:', headersContent);
    
    // More flexible header parsing for multiline content
    const headerLines = headersContent.split(/[,\n]/).filter(line => line.trim());
    console.log('Header lines:', headerLines);
    
    headerLines.forEach(line => {
      const headerMatch = line.match(/["']([^"']+)["']\s*:\s*(?:`([^`]*)`|["']([^"']*)["'])/);
      if (headerMatch) {
        const key = headerMatch[1];
        const value = headerMatch[2] || headerMatch[3] || '';
        console.log('Parsed header:', { key, value });
        headers[key] = value;
      }
    });
  }
  
  // Parse request body (for POST/PUT)
  let requestBody = '';
  if (method === 'POST' || method === 'PUT') {
    const dataMatch = optionsBlock.match(/data:\s*(\{[\s\S]*?\})/);
    console.log('Data match:', dataMatch);
    
    if (dataMatch) {
      try {
        // Try to parse and reformat the JSON
        const parsed = eval('(' + dataMatch[1] + ')'); // Using eval to handle object literals
        requestBody = JSON.stringify(parsed, null, 2);
        console.log('Parsed request body:', requestBody);
      } catch {
        // If parsing fails, use as-is
        requestBody = dataMatch[1];
        console.log('Failed to parse request body, using as-is:', requestBody);
      }
    }
  }
  
  // Check for expectations
  const expectStatusOk = stepBody.includes('expect(response).toBeOK()');
  const expectArrayNotEmpty = stepBody.includes('expect(data.length).toBeGreaterThan(0)');
  
  // Extract saveResponseAs from step description or return statement
  let saveResponseAs = '';
  const saveMatch = stepDescription.match(/save as (\w+)/);
  if (saveMatch) {
    saveResponseAs = saveMatch[1];
  } else if (stepBody.includes('return data')) {
    // Try to extract variable name from const assignment
    const constMatch = stepBody.match(/const\s+(\w+)\s*=/);
    if (constMatch) {
      saveResponseAs = constMatch[1];
    }
  }
  
  return {
    method: method as 'GET' | 'POST' | 'PUT' | 'DELETE',
    url,
    expectStatusOk,
    expectArrayNotEmpty,
    saveResponseAs,
    requestBody,
    headers,
    baseUrl
  };
}