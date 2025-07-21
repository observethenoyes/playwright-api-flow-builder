# Playwright API Flow Builder

A visual, drag-and-drop interface for creating Playwright API tests. Build complex API testing workflows with an intuitive flow-based editor that generates clean, production-ready Playwright test code.

![Playwright API Flow Builder](https://img.shields.io/badge/Next.js-15.2.2-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.0.0-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![Playwright](https://img.shields.io/badge/Playwright-1.51.0-green?logo=playwright)

## ✨ Features

### 🎯 **Visual Flow Builder**
- **Drag & Drop Interface**: Create API test flows by dragging HTTP method nodes
- **Left-to-Right Flow**: Intuitive workflow that follows natural reading patterns
- **Auto-Connect**: New nodes automatically connect to create seamless workflows
- **Smart Positioning**: Nodes intelligently position themselves for clean layouts

### 🌐 **Base URL Management**
- **Configurable Base URL**: Set your API base URL once, use relative paths everywhere
- **Environment Switching**: Easily switch between dev, staging, and production
- **Fixed Header**: Base URL always accessible at the top of the interface

### 🔧 **HTTP Methods Support**
- **GET Requests**: Fetch data with validation options
- **POST Requests**: Create resources with JSON body support
- **PUT Requests**: Update resources with full payload support
- **DELETE Requests**: Remove resources with proper error handling

### 💎 **Advanced Features**
- **Variable Chaining**: Save response data and use it in subsequent requests
- **Template Literals**: Use `${variable.property}` syntax in headers and bodies
- **Smart Headers**: Auto-add Content-Type headers for POST/PUT requests
- **Response Validation**: Built-in status and array validation options

### 🎨 **Professional UI**
- **Modern Design**: Clean, dark theme with smooth animations
- **Resizable Panels**: Adjust code preview panel to your preference
- **Live Code Generation**: See your Playwright test code update in real-time
- **Mouse Navigation**: Pan and zoom through your API flows naturally

### 📝 **Code Generation**
- **Clean Output**: Generates properly formatted TypeScript/JavaScript
- **Playwright Best Practices**: Uses test.step() for organized test structure
- **Template Literal Support**: Proper handling of dynamic values
- **Copy & Export**: One-click copy to clipboard or export functionality

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd playwright-api-flow-builder

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to start building your API flows!

## 💡 Usage

### 1. **Set Your Base URL**
Configure your API base URL in the header (e.g., `https://api.example.com`)

### 2. **Build Your Flow**
- Drag HTTP method nodes from the left palette
- Nodes automatically connect in sequence
- Configure each request with URLs, headers, and payloads

### 3. **Chain Requests**
- Save response data using the "Save Response As" field
- Reference saved data in later requests with `${variableName.property}`

### 4. **Generate & Export**
- View generated Playwright code in the right panel
- Copy to clipboard or export the test file
- Run tests with standard Playwright commands

### Example Flow
```typescript
// Generated from visual flow
test("API flow test", async ({ request }) => {
  const authToken = await test.step("POST and save as authToken", async () => {
    const response = await request.post(`${baseUrl}/oauth/token`, {
      data: {
        "grant_type": "client_credentials",
        "client_id": "your_client_id",
        "client_secret": "your_client_secret"
      },
      headers: {
        "Content-Type": "application/json"
      }
    });
    await expect(response).toBeOK();
    const data = await response.json();
    return data;
  });

  const userData = await test.step("GET and save as userData", async () => {
    const response = await request.get(`${baseUrl}/users`, {
      headers: {
        "Authorization": `Bearer ${authToken.access_token}`
      }
    });
    await expect(response).toBeOK();
    expect(data.length).toBeGreaterThan(0);
    const data = await response.json();
    return data;
  });
});
```

## 🛠️ Tech Stack

- **[Next.js 15.2.2](https://nextjs.org/)** - React framework
- **[React 19](https://reactjs.org/)** - UI library
- **[ReactFlow](https://reactflow.dev/)** - Flow-based editor
- **[Monaco Editor](https://microsoft.github.io/monaco-editor/)** - Code editor
- **[Tailwind CSS](https://tailwindcss.com/)** - Styling
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Playwright](https://playwright.dev/)** - Generated test framework

## 🎯 Use Cases

### 🔐 **Authentication Flows**
Perfect for OAuth2.0, JWT, and API key authentication patterns

### 🔄 **CRUD Operations** 
Build complete Create, Read, Update, Delete API test suites

### 📊 **Data Pipelines**
Test complex data processing workflows across multiple endpoints

### 🧪 **API Contract Testing**
Validate API responses, status codes, and data structures

### 🚀 **CI/CD Integration**
Generate tests that integrate seamlessly with your deployment pipeline

## 📄 Scripts

```bash
# Development
pnpm dev          # Start development server
pnpm build        # Build for production  
pnpm start        # Start production server
pnpm lint         # Run ESLint

# Testing (run generated Playwright tests)
npx playwright test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [ReactFlow](https://reactflow.dev/) for the visual flow editor
- Code editing powered by [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- Generates tests for [Playwright](https://playwright.dev/) testing framework
- UI components styled with [Tailwind CSS](https://tailwindcss.com/)

---

**Made with ❤️ for the API testing community**
