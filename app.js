  // Global variables
    let triggers = JSON.parse(localStorage.getItem('chatbotTriggers')) || [];
    let csvData = JSON.parse(localStorage.getItem('chatbotCSV')) || {};
    let currentResponseType = '';
    let emailEditor = null;
    let quoteEditor = null;

    // Initialize the application
    document.addEventListener('DOMContentLoaded', function () {
      initializeApp();
      setupEventListeners();
      loadData();
      updateStats();
    });

    function initializeApp() {
      // Setup response type selector
      document.querySelectorAll('.response-type-btn').forEach(btn => {
        btn.addEventListener('click', function () {
          selectResponseType(this.dataset.type);
        });
      });

      // Setup CSV upload
      const csvUpload = document.getElementById('csvUpload');
      csvUpload.addEventListener('change', handleCSVUpload);

      // Setup drag and drop for CSV
      const dropZone = document.querySelector('.file-drop-zone');
      dropZone.addEventListener('dragover', handleDragOver);
      dropZone.addEventListener('drop', handleDrop);
      dropZone.addEventListener('dragleave', handleDragLeave);

      // Setup search
      document.getElementById('searchTriggers').addEventListener('input', filterTriggers);

      // Setup preview input
      document.getElementById('previewInput').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
          sendPreviewMessage();
        }
      });
    }

    function setupEventListeners() {
      // Auto-save functionality
      setInterval(function () {
        saveData();
      }, 30000); // Auto-save every 30 seconds

      // Window beforeunload
      window.addEventListener('beforeunload', function () {
        saveData();
      });
    }

    function selectResponseType(type) {
      currentResponseType = type;

      // Update UI
      document.querySelectorAll('.response-type-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      document.querySelector(`[data-type="${type}"]`).classList.add('active');

      // Generate response content form
      generateResponseForm(type);
    }

    function generateResponseForm(type) {
      const container = document.getElementById('responseContent');
      container.style.display = 'block';

      let html = '';

      switch (type) {
        case 'text':
          html = `
                        <label class="form-label">Response Text</label>
                        <textarea id="responseText" class="form-control" rows="3" placeholder="Enter your response text..."></textarea>
                    `;
          break;

        case 'url':
          html = `
                        <div class="row">
                            <div class="col-md-6">
                                <label class="form-label">URL</label>
                                <input type="url" id="responseUrl" class="form-control" placeholder="https://example.com">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Link Text</label>
                                <input type="text" id="responseLinkText" class="form-control" placeholder="Click here">
                            </div>
                        </div>
                        <div class="form-check mt-2">
                            <input class="form-check-input" type="checkbox" id="openInNewTab">
                            <label class="form-check-label" for="openInNewTab">Open in new tab</label>
                        </div>
                    `;
          break;

        case 'document':
          html = `
                        <div class="row">
                            <div class="col-md-6">
                                <label class="form-label">Document URL</label>
                                <input type="url" id="documentUrl" class="form-control" placeholder="Link to PDF, DOC, etc.">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Document Title</label>
                                <input type="text" id="documentTitle" class="form-control" placeholder="Document name">
                            </div>
                        </div>
                        <div class="form-check mt-2">
                            <input class="form-check-input" type="checkbox" id="embedDocument">
                            <label class="form-check-label" for="embedDocument">Embed document (if supported)</label>
                        </div>
                    `;
          break;

        case 'email':
          html = `
                        <div class="row">
                            <div class="col-md-6">
                                <label class="form-label">Email Subject</label>
                                <input type="text" id="emailSubject" class="form-control" placeholder="Subject line">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Recipient (Optional)</label>
                                <input type="email" id="emailRecipient" class="form-control" placeholder="default@company.com">
                            </div>
                        </div>
                        <label class="form-label mt-3">Email Template</label>
                        <div id="emailEditor" style="height: 200px;"></div>
                    `;
          break;

        case 'quote':
          html = `
                        <label class="form-label">Quote Template</label>
                        <div id="quoteEditor" style="height: 200px;"></div>
                        <div class="form-check mt-2">
                            <input class="form-check-input" type="checkbox" id="useCSVData">
                            <label class="form-check-label" for="useCSVData">Use CSV data for calculations</label>
                        </div>
                    `;
          break;

        case 'csv':
          html = `
                        <div class="row">
                            <div class="col-md-6">
                                <label class="form-label">CSV File</label>
                                <select id="csvFileSelect" class="form-select">
                                    <option value="">Select CSV file...</option>
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Display Format</label>
                                <select id="csvDisplayFormat" class="form-select">
                                    <option value="table">Table</option>
                                    <option value="list">List</option>
                                    <option value="cards">Cards</option>
                                </select>
                            </div>
                        </div>
                        <div class="mt-3">
                            <label class="form-label">Search/Filter Column (Optional)</label>
                            <input type="text" id="csvFilterColumn" class="form-control" placeholder="e.g., name, company">
                        </div>
                    `;
          break;

        case 'html':
          html = `
                        <div class="side-notes">
                            <h6><i class="bi bi-lightbulb"></i> HTML Code Block Builder</h6>
                            <p>Create responsive HTML components with Bootstrap classes. Perfect for landing pages, forms, cards, and layouts.</p>
                        </div>
                        <div class="code-tabs">
                            <button class="code-tab active" onclick="switchCodeTab('html')">HTML</button>
                            <button class="code-tab" onclick="switchCodeTab('css')">CSS</button>
                            <button class="code-tab" onclick="switchCodeTab('preview')">Live Preview</button>
                        </div>
                        <div id="htmlCodeTab" class="code-tab-content">
                            <label class="form-label">HTML Code</label>
                            <textarea id="htmlCode" class="form-control code-editor" rows="12" placeholder="Enter your HTML code here...">
<div class="container mt-4">
    <div class="card">
        <div class="card-header">
            <h5>Sample Component</h5>
        </div>
        <div class="card-body">
            <p>Your content here...</p>
            <button class="btn btn-primary">Action Button</button>
        </div>
    </div>
</div></textarea>
                        </div>
                        <div id="cssCodeTab" class="code-tab-content" style="display: none;">
                            <label class="form-label">Custom CSS (Optional)</label>
                            <textarea id="customCSS" class="form-control code-editor" rows="8" placeholder="/* Add custom styles here */
.custom-style {
    background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
    border-radius: 10px;
}"></textarea>
                        </div>
                        <div id="previewCodeTab" class="code-tab-content" style="display: none;">
                            <div class="live-preview-container">
                                <div class="preview-toolbar">
                                    <span>Live Preview</span>
                                    <div class="responsive-controls">
                                        <button class="device-btn active" onclick="setPreviewSize('desktop')">Desktop</button>
                                        <button class="device-btn" onclick="setPreviewSize('tablet')">Tablet</button>
                                        <button class="device-btn" onclick="setPreviewSize('mobile')">Mobile</button>
                                    </div>
                                </div>
                                <iframe id="codePreview" class="preview-frame"></iframe>
                            </div>
                        </div>
                        <div class="integration-steps mt-3">
                            <h6><i class="bi bi-gear"></i> Integration Steps:</h6>
                            <ol>
                                <li>Copy the generated HTML code</li>
                                <li>Paste into your website where needed</li>
                                <li>Ensure Bootstrap 5 CSS is loaded in your page</li>
                                <li>Test responsiveness across devices</li>
                            </ol>
                        </div>
                    `;
          break;

        case 'javascript':
          html = `
                        <div class="side-notes">
                            <h6><i class="bi bi-code-slash"></i> JavaScript Snippet Builder</h6>
                            <p>Create interactive JavaScript functions with Bootstrap integration. Includes form validation, animations, API calls, and more.</p>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <label class="form-label">Function Type</label>
                                <select id="jsFunction" class="form-select" onchange="loadJSTemplate()">
                                    <option value="custom">Custom Function</option>
                                    <option value="form_validation">Form Validation</option>
                                    <option value="api_call">API Call</option>
                                    <option value="animation">Animation Effect</option>
                                    <option value="modal_handler">Modal Handler</option>
                                    <option value="data_table">Data Table</option>
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Target Element ID</label>
                                <input type="text" id="targetElement" class="form-control" placeholder="e.g., myButton, contactForm">
                            </div>
                        </div>
                        <div class="code-tabs mt-3">
                            <button class="code-tab active" onclick="switchCodeTab('javascript')">JavaScript</button>
                            <button class="code-tab" onclick="switchCodeTab('html-js')">HTML</button>
                            <button class="code-tab" onclick="switchCodeTab('demo')">Demo</button>
                        </div>
                        <div id="javascriptCodeTab" class="code-tab-content">
                            <label class="form-label">JavaScript Code</label>
                            <textarea id="jsCode" class="form-control code-editor" rows="12" placeholder="// Your JavaScript code here
function myFunction() {
    console.log('Hello from your chatbot!');
}"></textarea>
                        </div>
                        <div id="htmlJsTab" class="code-tab-content" style="display: none;">
                            <label class="form-label">Required HTML</label>
                            <textarea id="jsHtmlCode" class="form-control code-editor" rows="6" placeholder="<!-- HTML structure needed for your JS -->" readonly></textarea>
                        </div>
                        <div id="demoCodeTab" class="code-tab-content" style="display: none;">
                            <div class="live-preview-container">
                                <div class="preview-toolbar">
                                    <span>Interactive Demo</span>
                                    <button class="btn btn-sm btn-outline-primary" onclick="runJSDemo()">Run Code</button>
                                </div>
                                <div id="jsDemoArea" class="p-3" style="min-height: 200px; background: white;">
                                    <!-- Demo will appear here -->
                                </div>
                            </div>
                        </div>
                        <div class="integration-steps mt-3">
                            <h6><i class="bi bi-puzzle"></i> Integration Guide:</h6>
                            <ol>
                                <li>Add the HTML structure to your page</li>
                                <li>Include the JavaScript code before closing &lt;/body&gt; tag</li>
                                <li>Ensure jQuery/Bootstrap JS is loaded if needed</li>
                                <li>Test functionality in browser console</li>
                            </ol>
                        </div>
                    `;
          break;

        case 'template':
          html = `
                        <div class="side-notes">
                            <h6><i class="bi bi-palette"></i> Bootstrap Template Generator</h6>
                            <p>Choose from professional templates and customize them instantly. No coding required!</p>
                        </div>
                        <div class="template-gallery">
                            <div class="template-card" data-template="landing">
                                <div class="template-preview">
                                    <div style="background: linear-gradient(45deg, #667eea, #764ba2); height: 40px; margin: -5px -5px 5px -5px;"></div>
                                    <div style="padding: 10px; font-size: 10px;">
                                        <div style="background: #f8f9fa; height: 8px; margin-bottom: 3px;"></div>
                                        <div style="background: #dee2e6; height: 6px; width: 80%; margin-bottom: 2px;"></div>
                                        <div style="background: #6c757d; height: 4px; width: 60%;"></div>
                                    </div>
                                </div>
                                <strong>Landing Page</strong><br>
                                <small>Hero, features, CTA</small>
                            </div>
                            <div class="template-card" data-template="dashboard">
                                <div class="template-preview">
                                    <div style="background: #343a40; height: 20px; margin: -5px -5px 5px -5px;"></div>
                                    <div style="display: flex; height: 80px;">
                                        <div style="background: #495057; width: 30%; margin-right: 5px;"></div>
                                        <div style="flex: 1;">
                                            <div style="background: #6c757d; height: 25px; margin-bottom: 5px;"></div>
                                            <div style="background: #adb5bd; height: 25px; margin-bottom: 5px;"></div>
                                            <div style="background: #ced4da; height: 20px;"></div>
                                        </div>
                                    </div>
                                </div>
                                <strong>Dashboard</strong><br>
                                <small>Sidebar, cards, charts</small>
                            </div>
                            <div class="template-card" data-template="portfolio">
                                <div class="template-preview">
                                    <div style="background: #212529; height: 25px; margin: -5px -5px 5px -5px;"></div>
                                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 3px; height: 75px;">
                                        <div style="background: #495057;"></div>
                                        <div style="background: #6c757d;"></div>
                                        <div style="background: #adb5bd;"></div>
                                        <div style="background: #ced4da;"></div>
                                    </div>
                                </div>
                                <strong>Portfolio</strong><br>
                                <small>Gallery, projects, contact</small>
                            </div>
                            <div class="template-card" data-template="ecommerce">
                                <div class="template-preview">
                                    <div style="background: #28a745; height: 20px; margin: -5px -5px 5px -5px;"></div>
                                    <div style="display: flex; flex-wrap: wrap; gap: 2px; height: 80px;">
                                        <div style="background: #6f42c1; width: 30%; height: 35px;"></div>
                                        <div style="background: #fd7e14; width: 30%; height: 35px;"></div>
                                        <div style="background: #20c997; width: 30%; height: 35px;"></div>
                                        <div style="background: #ffc107; width: 60%; height: 35px;"></div>
                                    </div>
                                </div>
                                <strong>E-commerce</strong><br>
                                <small>Products, cart, checkout</small>
                            </div>
                            <div class="template-card" data-template="blog">
                                <div class="template-preview">
                                    <div style="background: #dc3545; height: 25px; margin: -5px -5px 5px -5px;"></div>
                                    <div style="padding: 5px;">
                                        <div style="background: #f8f9fa; height: 12px; margin-bottom: 3px;"></div>
                                        <div style="background: #e9ecef; height: 8px; margin-bottom: 2px;"></div>
                                        <div style="background: #dee2e6; height: 6px; width: 70%; margin-bottom: 2px;"></div>
                                        <div style="background: #ced4da; height: 15px;"></div>
                                    </div>
                                </div>
                                <strong>Blog</strong><br>
                                <small>Posts, sidebar, comments</small>
                            </div>
                            <div class="template-card" data-template="forms">
                                <div class="template-preview">
                                    <div style="background: #6f42c1; height: 20px; margin: -5px -5px 5px -5px;"></div>
                                    <div style="padding: 10px;">
                                        <div style="background: #f8f9fa; height: 8px; margin-bottom: 4px; width: 90%;"></div>
                                        <div style="background: white; border: 1px solid #dee2e6; height: 12px; margin-bottom: 4px;"></div>
                                        <div style="background: #f8f9fa; height: 8px; margin-bottom: 4px; width: 70%;"></div>
                                        <div style="background: white; border: 1px solid #dee2e6; height: 12px; margin-bottom: 4px;"></div>
                                        <div style="background: #007bff; height: 10px; width: 40%;"></div>
                                    </div>
                                </div>
                                <strong>Forms</strong><br>
                                <small>Contact, registration, survey</small>
                            </div>
                        </div>
                        <div id="templateCustomization" style="display: none;">
                            <div class="feature-highlight">
                                <h6><i class="bi bi-sliders"></i> Customize Your Template</h6>
                                <div class="row">
                                    <div class="col-md-4">
                                        <label class="form-label">Primary Color</label>
                                        <input type="color" id="primaryColor" class="form-control form-control-color" value="#6f42c1">
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label">Text Style</label>
                                        <select id="textStyle" class="form-select">
                                            <option value="modern">Modern</option>
                                            <option value="classic">Classic</option>
                                            <option value="bold">Bold</option>
                                        </select>
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label">Layout</label>
                                        <select id="layoutStyle" class="form-select">
                                            <option value="standard">Standard</option>
                                            <option value="wide">Wide</option>
                                            <option value="compact">Compact</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="mt-3">
                                    <label class="form-label">Company/Project Name</label>
                                    <input type="text" id="projectName" class="form-control" placeholder="Enter your project name">
                                </div>
                                <button class="btn btn-primary mt-3" onclick="generateTemplate()">
                                    <i class="bi bi-magic"></i> Generate Template
                                </button>
                            </div>
                        </div>
                        <div id="templateCode" style="display: none;">
                            <div class="code-tabs">
                                <button class="code-tab active" onclick="switchCodeTab('template-html')">HTML</button>
                                <button class="code-tab" onclick="switchCodeTab('template-css')">CSS</button>
                                <button class="code-tab" onclick="switchCodeTab('template-preview')">Preview</button>
                            </div>
                            <div id="templateHtmlTab" class="code-tab-content">
                                <textarea id="generatedHTML" class="form-control code-editor" rows="15" readonly></textarea>
                            </div>
                            <div id="templateCssTab" class="code-tab-content" style="display: none;">
                                <textarea id="generatedCSS" class="form-control code-editor" rows="15" readonly></textarea>
                            </div>
                            <div id="templatePreviewTab" class="code-tab-content" style="display: none;">
                                <div class="live-preview-container">
                                    <div class="preview-toolbar">
                                        <span>Template Preview</span>
                                        <div class="responsive-controls">
                                            <button class="device-btn active" onclick="setTemplatePreviewSize('desktop')">Desktop</button>
                                            <button class="device-btn" onclick="setTemplatePreviewSize('tablet')">Tablet</button>
                                            <button class="device-btn" onclick="setTemplatePreviewSize('mobile')">Mobile</button>
                                        </div>
                                    </div>
                                    <iframe id="templatePreview" class="preview-frame"></iframe>
                                </div>
                            </div>
                        </div>
                        <div class="integration-steps">
                            <h6><i class="bi bi-download"></i> How to Use This Template:</h6>
                            <ol>
                                <li>Download the generated HTML and CSS files</li>
                                <li>Upload to your web hosting service</li>
                                <li>Customize content and images as needed</li>
                                <li>Link Bootstrap 5 CDN for full functionality</li>
                                <li>Test across different devices and browsers</li>
                            </ol>
                        </div>
                    `;
          break;
      }

      container.innerHTML = html;

      // Initialize editors if needed
      setTimeout(() => {
        if (type === 'email' && !emailEditor) {
          emailEditor = new Quill('#emailEditor', {
            theme: 'snow',
            placeholder: 'Compose your email template...',
            modules: {
              toolbar: [
                ['bold', 'italic', 'underline'],
                ['link'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['clean']
              ]
            }
          });
        }

        if (type === 'quote' && !quoteEditor) {
          quoteEditor = new Quill('#quoteEditor', {
            theme: 'snow',
            placeholder: 'Create your quote template...',
            modules: {
              toolbar: [
                ['bold', 'italic', 'underline'],
                ['link'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                [{ 'header': [1, 2, 3, false] }],
                ['clean']
              ]
            }
          });
        }

        if (type === 'csv') {
          populateCSVSelect();
        }
      }, 100);
    }

    function populateCSVSelect() {
      const select = document.getElementById('csvFileSelect');
      if (!select) return;

      select.innerHTML = '<option value="">Select CSV file...</option>';

      Object.keys(csvData).forEach(filename => {
        const option = document.createElement('option');
        option.value = filename;
        option.textContent = filename;
        select.appendChild(option);
      });
    }

    function addTrigger() {
      const triggerText = document.getElementById('triggerInput').value.trim();
      const category = document.getElementById('categorySelect').value;

      if (!triggerText) {
        showToast('Please enter a trigger phrase', 'warning');
        return;
      }

      if (!currentResponseType) {
        showToast('Please select a response type', 'warning');
        return;
      }

      const responseData = gatherResponseData();
      if (!responseData) {
        showToast('Please fill in the response content', 'warning');
        return;
      }

      const trigger = {
        id: Date.now(),
        text: triggerText,
        category: category,
        responseType: currentResponseType,
        responseData: responseData,
        created: new Date().toISOString(),
        usage: 0
      };

      triggers.push(trigger);
      saveData();
      renderTriggers();
      updateStats();
      clearForm();

      showToast('Trigger added successfully!', 'success');
    }

    function gatherResponseData() {
      switch (currentResponseType) {
        case 'text':
          const text = document.getElementById('responseText').value.trim();
          return text ? { text } : null;

        case 'url':
          const url = document.getElementById('responseUrl').value.trim();
          const linkText = document.getElementById('responseLinkText').value.trim();
          const newTab = document.getElementById('openInNewTab').checked;
          return url ? { url, linkText: linkText || url, newTab } : null;

        case 'document':
          const docUrl = document.getElementById('documentUrl').value.trim();
          const docTitle = document.getElementById('documentTitle').value.trim();
          const embed = document.getElementById('embedDocument').checked;
          return docUrl ? { url: docUrl, title: docTitle || 'Document', embed } : null;

        case 'email':
          const subject = document.getElementById('emailSubject').value.trim();
          const recipient = document.getElementById('emailRecipient').value.trim();
          const content = emailEditor ? emailEditor.root.innerHTML : '';
          return subject ? { subject, recipient, content } : null;

        case 'quote':
          const quoteContent = quoteEditor ? quoteEditor.root.innerHTML : '';
          const useCSV = document.getElementById('useCSVData').checked;
          return quoteContent ? { content: quoteContent, useCSV } : null;

        case 'csv':
          const csvFile = document.getElementById('csvFileSelect').value;
          const displayFormat = document.getElementById('csvDisplayFormat').value;
          const filterColumn = document.getElementById('csvFilterColumn').value.trim();
          return csvFile ? { file: csvFile, displayFormat, filterColumn } : null;

        case 'html':
          const htmlCode = document.getElementById('htmlCode').value.trim();
          const customCSS = document.getElementById('customCSS').value.trim();
          return htmlCode ? { htmlCode, customCSS } : null;

        case 'javascript':
          const jsCode = document.getElementById('jsCode').value.trim();
          const jsHtmlCode = document.getElementById('jsHtmlCode').value.trim();
          const targetElement = document.getElementById('targetElement').value.trim();
          const jsFunction = document.getElementById('jsFunction').value;
          return jsCode ? { jsCode, jsHtmlCode, targetElement, jsFunction } : null;

        case 'template':
          const selectedTemplate = document.querySelector('.template-card.selected');
          if (!selectedTemplate) return null;
          const templateType = selectedTemplate.dataset.template;
          const primaryColor = document.getElementById('primaryColor') ? document.getElementById('primaryColor').value : '#6f42c1';
          const textStyle = document.getElementById('textStyle') ? document.getElementById('textStyle').value : 'modern';
          const layoutStyle = document.getElementById('layoutStyle') ? document.getElementById('layoutStyle').value : 'standard';
          const projectName = document.getElementById('projectName') ? document.getElementById('projectName').value.trim() : 'My Project';
          const generatedHTML = document.getElementById('generatedHTML') ? document.getElementById('generatedHTML').value : '';
          const generatedCSS = document.getElementById('generatedCSS') ? document.getElementById('generatedCSS').value : '';
          return { templateType, primaryColor, textStyle, layoutStyle, projectName, generatedHTML, generatedCSS };

        default:
          return null;
      }
    }

    function renderTriggers() {
      const container = document.getElementById('triggersList');

      if (triggers.length === 0) {
        container.innerHTML = `
                    <div class="text-center text-muted py-4">
                        <i class="bi bi-robot" style="font-size: 3rem;"></i>
                        <p>No triggers created yet. Add your first trigger above!</p>
                    </div>
                `;
        return;
      }

      const html = triggers.map(trigger => `
                <div class="trigger-item" data-id="${trigger.id}">
                    <div class="d-flex justify-content-between align-items-start">
                        <div class="flex-grow-1">
                            <div class="d-flex align-items-center mb-2">
                                <span class="badge bg-primary me-2">${trigger.responseType}</span>
                                ${trigger.category ? `<span class="badge bg-secondary me-2">${trigger.category}</span>` : ''}
                                <small class="text-muted">Used ${trigger.usage} times</small>
                            </div>
                            <h6 class="mb-1">"${trigger.text}"</h6>
                            <small class="text-muted">${getResponsePreview(trigger)}</small>
                        </div>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary" onclick="editTrigger(${trigger.id})" title="Edit">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-outline-warning" onclick="testTrigger(${trigger.id})" title="Test">
                                <i class="bi bi-play"></i>
                            </button>
                            <button class="btn btn-outline-danger" onclick="deleteTrigger(${trigger.id})" title="Delete">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');

      container.innerHTML = html;
    }

    function getResponsePreview(trigger) {
      const data = trigger.responseData;
      switch (trigger.responseType) {
        case 'text':
          return data.text.substring(0, 100) + (data.text.length > 100 ? '...' : '');
        case 'url':
          return `Link to: ${data.url}`;
        case 'document':
          return `Document: ${data.title}`;
        case 'email':
          return `Email: ${data.subject}`;
        case 'quote':
          return 'Quote template';
        case 'csv':
          return `CSV data from: ${data.file}`;
        case 'html':
          return 'HTML code block with Bootstrap styling';
        case 'javascript':
          return `JavaScript: ${data.jsFunction || 'Custom function'}`;
        case 'template':
          return `${data.templateType} template for ${data.projectName}`;
        default:
          return 'Unknown response type';
      }
    }

    function deleteTrigger(id) {
      if (confirm('Are you sure you want to delete this trigger?')) {
        triggers = triggers.filter(t => t.id !== id);
        saveData();
        renderTriggers();
        updateStats();
        showToast('Trigger deleted', 'info');
      }
    }

    function testTrigger(id) {
      const trigger = triggers.find(t => t.id === id);
      if (trigger) {
        simulateResponse(trigger.text);
      }
    }

    function sendPreviewMessage() {
      const input = document.getElementById('previewInput');
      const message = input.value.trim();

      if (!message) return;

      // Add user message
      addChatMessage(message, 'user');

      // Clear input
      input.value = '';

      // Find matching trigger
      simulateResponse(message);
    }

    function simulateResponse(userMessage) {
      const matchedTrigger = findMatchingTrigger(userMessage);

      if (matchedTrigger) {
        // Increment usage
        matchedTrigger.usage++;
        saveData();
        updateStats();

        // Generate response based on type
        const response = generateResponse(matchedTrigger);
        addChatMessage(response, 'bot');
      } else {
        addChatMessage("I'm sorry, I don't understand that. Try one of my programmed triggers!", 'bot');
      }
    }

    function findMatchingTrigger(message) {
      const lowerMessage = message.toLowerCase();
      return triggers.find(trigger => {
        const lowerTrigger = trigger.text.toLowerCase();
        return lowerMessage.includes(lowerTrigger) || lowerTrigger.includes(lowerMessage);
      });
    }

    function generateResponse(trigger) {
      const data = trigger.responseData;

      switch (trigger.responseType) {
        case 'text':
          return data.text;

        case 'url':
          return `<a href="${data.url}" ${data.newTab ? 'target="_blank"' : ''}>${data.linkText}</a>`;

        case 'document':
          return `<a href="${data.url}" target="_blank"><i class="bi bi-file-earmark"></i> ${data.title}</a>`;

        case 'email':
          const emailLink = `mailto:${data.recipient || ''}?subject=${encodeURIComponent(data.subject)}`;
          return `<a href="${emailLink}"><i class="bi bi-envelope"></i> Send Email: ${data.subject}</a>`;

        case 'quote':
          return `<div class="quote-response">${data.content}</div>`;

        case 'csv':
          return generateCSVResponse(data);

        case 'html':
          return generateHTMLResponse(data);

        case 'javascript':
          return generateJavaScriptResponse(data);

        case 'template':
          return generateTemplateResponse(data);

        default:
          return 'Response type not implemented yet.';
      }
    }

    function generateCSVResponse(data) {
      const csvContent = csvData[data.file];
      if (!csvContent || !csvContent.length) {
        return 'CSV data not found.';
      }

      switch (data.displayFormat) {
        case 'table':
          return generateCSVTable(csvContent);
        case 'list':
          return generateCSVList(csvContent);
        case 'cards':
          return generateCSVCards(csvContent);
        default:
          return 'Invalid display format.';
      }
    }

    function generateCSVTable(data) {
      if (!data.length) return 'No data available.';

      const headers = Object.keys(data[0]);
      let html = '<table class="table table-sm table-dark">';
      html += '<thead><tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr></thead>';
      html += '<tbody>';

      data.slice(0, 5).forEach(row => { // Limit to 5 rows for preview
        html += '<tr>' + headers.map(h => `<td>${row[h] || ''}</td>`).join('') + '</tr>';
      });

      html += '</tbody></table>';
      if (data.length > 5) {
        html += `<small class="text-muted">Showing 5 of ${data.length} records</small>`;
      }

      return html;
    }

    function generateCSVList(data) {
      if (!data.length) return 'No data available.';

      return data.slice(0, 3).map(row => {
        const entries = Object.entries(row);
        return entries.map(([key, value]) => `<strong>${key}:</strong> ${value}`).join('<br>');
      }).join('<hr>') + (data.length > 3 ? `<br><small class="text-muted">And ${data.length - 3} more...</small>` : '');
    }

    function generateCSVCards(data) {
      if (!data.length) return 'No data available.';

      return data.slice(0, 2).map(row => {
        const entries = Object.entries(row);
        return `<div class="card card-sm mb-2">
                    <div class="card-body p-2">
                        ${entries.map(([key, value]) => `<div><small class="text-muted">${key}:</small> ${value}</div>`).join('')}
                    </div>
                </div>`;
      }).join('') + (data.length > 2 ? `<small class="text-muted">And ${data.length - 2} more...</small>` : '');
    }

    function addChatMessage(message, sender) {
      const chatPreview = document.getElementById('chatPreview');
      const messageDiv = document.createElement('div');
      messageDiv.className = `chat-message ${sender}`;
      messageDiv.innerHTML = `<strong>${sender === 'user' ? 'You' : 'Bot'}:</strong> ${message}`;

      chatPreview.appendChild(messageDiv);
      chatPreview.scrollTop = chatPreview.scrollHeight;
    }

    function clearChat() {
      const chatPreview = document.getElementById('chatPreview');
      chatPreview.innerHTML = `
                <div class="chat-message bot">
                    <strong>Bot:</strong> Hello! I'm your chatbot. Try typing a trigger phrase below.
                </div>
            `;
    }

    function handleCSVUpload(event) {
      const files = event.target.files;
      for (let file of files) {
        if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
          parseCSVFile(file);
        }
      }
    }

    function parseCSVFile(file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const csv = e.target.result;
        const parsed = parseCSV(csv);
        csvData[file.name] = parsed;
        saveData();
        renderCSVList();
        updateStats();
        showToast(`CSV file "${file.name}" uploaded successfully!`, 'success');
      };
      reader.readAsText(file);
    }

    function parseCSV(csv) {
      const lines = csv.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const data = [];

      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          const row = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          data.push(row);
        }
      }

      return data;
    }

    function renderCSVList() {
      const container = document.getElementById('csvList');

      if (Object.keys(csvData).length === 0) {
        container.innerHTML = '<p class="text-muted text-center">No CSV files uploaded yet.</p>';
        return;
      }

      const html = Object.entries(csvData).map(([filename, data]) => `
                <div class="csv-item mb-2">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <strong>${filename}</strong>
                            <br><small class="text-muted">${data.length} records</small>
                        </div>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-info" onclick="previewCSV('${filename}')" title="Preview">
                                <i class="bi bi-eye"></i>
                            </button>
                            <button class="btn btn-outline-danger" onclick="deleteCSV('${filename}')" title="Delete">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');

      container.innerHTML = html;
    }

    function previewCSV(filename) {
      const data = csvData[filename];
      if (!data || !data.length) return;

      let preview = `<strong>${filename}</strong> (${data.length} records)\n\n`;
      preview += generateCSVTable(data.slice(0, 3));

      showModal('CSV Preview', preview);
    }

    function deleteCSV(filename) {
      if (confirm(`Delete CSV file "${filename}"?`)) {
        delete csvData[filename];
        saveData();
        renderCSVList();
        updateStats();
        showToast('CSV file deleted', 'info');
      }
    }

    function handleDragOver(e) {
      e.preventDefault();
      e.currentTarget.classList.add('drag-over');
    }

    function handleDragLeave(e) {
      e.currentTarget.classList.remove('drag-over');
    }

    function handleDrop(e) {
      e.preventDefault();
      e.currentTarget.classList.remove('drag-over');

      const files = e.dataTransfer.files;
      for (let file of files) {
        if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
          parseCSVFile(file);
        }
      }
    }

    function filterTriggers() {
      const search = document.getElementById('searchTriggers').value.toLowerCase();
      const triggerItems = document.querySelectorAll('.trigger-item');

      triggerItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(search) ? 'block' : 'none';
      });
    }

    function clearForm() {
      document.getElementById('triggerInput').value = '';
      document.getElementById('categorySelect').value = '';
      document.querySelectorAll('.response-type-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      document.getElementById('responseContent').style.display = 'none';
      currentResponseType = '';

      // Reset editors
      if (emailEditor) {
        emailEditor.setContents([]);
      }
      if (quoteEditor) {
        quoteEditor.setContents([]);
      }
    }

    function updateStats() {
      document.getElementById('triggerCount').textContent = triggers.length;
      document.getElementById('responseCount').textContent = triggers.length;
      document.getElementById('csvCount').textContent = Object.keys(csvData).length;

      const templateCount = triggers.filter(t => t.responseType === 'email' || t.responseType === 'quote').length;
      document.getElementById('templateCount').textContent = templateCount;
    }

    function saveData() {
      localStorage.setItem('chatbotTriggers', JSON.stringify(triggers));
      localStorage.setItem('chatbotCSV', JSON.stringify(csvData));
    }

    function loadData() {
      renderTriggers();
      renderCSVList();
    }

    function exportData() {
      const exportData = {
        triggers: triggers,
        csvData: csvData,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chatbot-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      showToast('Data exported successfully!', 'success');
    }

    function importData() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = function (e) {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function (e) {
            try {
              const data = JSON.parse(e.target.result);
              if (data.triggers && data.csvData) {
                triggers = data.triggers;
                csvData = data.csvData;
                saveData();
                loadData();
                updateStats();
                showToast('Data imported successfully!', 'success');
              } else {
                showToast('Invalid backup file format', 'danger');
              }
            } catch (error) {
              showToast('Error parsing backup file', 'danger');
            }
          };
          reader.readAsText(file);
        }
      };
      input.click();
    }

    function clearAllData() {
      if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
        triggers = [];
        csvData = {};
        saveData();
        loadData();
        updateStats();
        clearChat();
        showToast('All data cleared', 'warning');
      }
    }

    function addSampleData() {
      const sampleTriggers = [
        {
          id: Date.now() + 1,
          text: 'hello',
          category: 'greeting',
          responseType: 'text',
          responseData: { text: 'Hello! How can I help you today?' },
          created: new Date().toISOString(),
          usage: 0
        },
        {
          id: Date.now() + 2,
          text: 'contact',
          category: 'contact',
          responseType: 'text',
          responseData: { text: 'You can reach us at contact@company.com or call (555) 123-4567' },
          created: new Date().toISOString(),
          usage: 0
        },
        {
          id: Date.now() + 3,
          text: 'website',
          category: 'info',
          responseType: 'url',
          responseData: { url: 'https://example.com', linkText: 'Visit our website', newTab: true },
          created: new Date().toISOString(),
          usage: 0
        }
      ];

      triggers.push(...sampleTriggers);
      saveData();
      renderTriggers();
      updateStats();
      showToast('Sample data added!', 'success');
    }

    function validateBot() {
      const issues = [];

      if (triggers.length === 0) {
        issues.push('No triggers defined');
      }

      const duplicateTriggers = triggers.filter((t1, i) =>
        triggers.findIndex(t2 => t2.text.toLowerCase() === t1.text.toLowerCase()) !== i
      );

      if (duplicateTriggers.length > 0) {
        issues.push(`Duplicate triggers found: ${duplicateTriggers.map(t => t.text).join(', ')}`);
      }

      const csvTriggers = triggers.filter(t => t.responseType === 'csv');
      csvTriggers.forEach(trigger => {
        if (!csvData[trigger.responseData.file]) {
          issues.push(`CSV file not found: ${trigger.responseData.file}`);
        }
      });

      if (issues.length === 0) {
        showToast('✅ Bot validation passed!', 'success');
      } else {
        showModal('Validation Issues', issues.map(issue => `• ${issue}`).join('<br>'));
      }
    }

    function showStats() {
      const totalUsage = triggers.reduce((sum, t) => sum + t.usage, 0);
      const avgUsage = triggers.length > 0 ? (totalUsage / triggers.length).toFixed(1) : 0;
      const mostUsed = triggers.reduce((max, t) => t.usage > max.usage ? t : max, { usage: 0, text: 'None' });

      const stats = `
                <strong>Bot Statistics:</strong><br><br>
                • Total Triggers: ${triggers.length}<br>
                • Total Usage: ${totalUsage}<br>
                • Average Usage: ${avgUsage}<br>
                • Most Used: "${mostUsed.text}" (${mostUsed.usage} times)<br>
                • CSV Files: ${Object.keys(csvData).length}<br>
                • Categories: ${[...new Set(triggers.map(t => t.category).filter(c => c))].length}
            `;

      showModal('Statistics', stats);
    }

    function optimizeBot() {
      let optimizations = [];

      // Find unused triggers
      const unused = triggers.filter(t => t.usage === 0);
      if (unused.length > 0) {
        optimizations.push(`${unused.length} triggers have never been used`);
      }

      // Find similar triggers
      const similar = [];
      for (let i = 0; i < triggers.length; i++) {
        for (let j = i + 1; j < triggers.length; j++) {
          const similarity = calculateSimilarity(triggers[i].text, triggers[j].text);
          if (similarity > 0.7) {
            similar.push(`"${triggers[i].text}" and "${triggers[j].text}" are very similar`);
          }
        }
      }

      if (similar.length > 0) {
        optimizations.push(...similar);
      }

      if (optimizations.length === 0) {
        showToast('🚀 Bot is already optimized!', 'success');
      } else {
        showModal('Optimization Suggestions', optimizations.map(opt => `• ${opt}`).join('<br>'));
      }
    }

    function calculateSimilarity(str1, str2) {
      const longer = str1.length > str2.length ? str1 : str2;
      const shorter = str1.length > str2.length ? str2 : str1;

      if (longer.length === 0) return 1.0;

      return (longer.length - editDistance(longer, shorter)) / longer.length;
    }

    function editDistance(str1, str2) {
      const matrix = [];

      for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
      }

      for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
      }

      for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
          if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
            matrix[i][j] = matrix[i - 1][j - 1];
          } else {
            matrix[i][j] = Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            );
          }
        }
      }

      return matrix[str2.length][str1.length];
    }

    function scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function showToast(message, type = 'info') {
      const toastContainer = document.querySelector('.toast-container');
      const toast = document.createElement('div');
      toast.className = `toast align-items-center text-bg-${type} border-0`;
      toast.setAttribute('role', 'alert');
      toast.innerHTML = `
                <div class="d-flex">
                    <div class="toast-body">${message}</div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            `;

      toastContainer.appendChild(toast);
      const bsToast = new bootstrap.Toast(toast);
      bsToast.show();

      setTimeout(() => {
        toast.remove();
      }, 5000);
    }

    function showModal(title, content) {
      // Create modal if it doesn't exist
      let modal = document.getElementById('dynamicModal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'dynamicModal';
        modal.className = 'modal fade';
        modal.innerHTML = `
                    <div class="modal-dialog">
                        <div class="modal-content bg-dark">
                            <div class="modal-header">
                                <h5 class="modal-title"></h5>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body"></div>
                        </div>
                    </div>
                `;
        document.body.appendChild(modal);
      }

      modal.querySelector('.modal-title').textContent = title;
      modal.querySelector('.modal-body').innerHTML = content;

      const bsModal = new bootstrap.Modal(modal);
      bsModal.show();
    }

    // ========================================
    // NEW CODE GENERATION FUNCTIONS
    // ========================================

    function generateHTMLResponse(data) {
      return '<div class="code-response">' +
        '<div class="d-flex justify-content-between align-items-center mb-3">' +
        '<h6><i class="bi bi-code-slash"></i> HTML Code Block</h6>' +
        '<button class="btn btn-sm btn-outline-primary" onclick="copyToClipboard(\'' + btoa(data.htmlCode) + '\')">' +
        '<i class="bi bi-clipboard"></i> Copy' +
        '</button>' +
        '</div>' +
        '<div class="live-preview-container">' +
        '<div class="preview-toolbar">' +
        '<span>Live Preview</span>' +
        '<button class="btn btn-sm btn-primary" onclick="showCodeModal(\'HTML Code\', \'' + btoa(data.htmlCode) + '\', \'' + btoa(data.customCSS || '') + '\')">' +
        '<i class="bi bi-eye"></i> View Full Code' +
        '</button>' +
        '</div>' +
        '<div style="background: white; padding: 15px; border-radius: 0 0 8px 8px;">' +
        data.htmlCode +
        (data.customCSS ? '<style>' + data.customCSS + '</style>' : '') +
        '</div>' +
        '</div>' +
        '<div class="integration-steps mt-3">' +
        '<small><strong>Integration:</strong> Copy HTML code → Paste in your website → Ensure Bootstrap 5 is loaded</small>' +
        '</div>' +
        '</div>';
    }

    function generateJavaScriptResponse(data) {
      return '<div class="code-response">' +
        '<div class="d-flex justify-content-between align-items-center mb-3">' +
        '<h6><i class="bi bi-braces"></i> JavaScript Function</h6>' +
        '<button class="btn btn-sm btn-outline-primary" onclick="copyToClipboard(\'' + btoa(data.jsCode) + '\')">' +
        '<i class="bi bi-clipboard"></i> Copy JS' +
        '</button>' +
        '</div>' +
        '<div class="feature-highlight">' +
        '<strong>Function Type:</strong> ' + data.jsFunction + '<br>' +
        (data.targetElement ? '<strong>Target Element:</strong> #' + data.targetElement + '<br>' : '') +
        '<button class="btn btn-sm btn-success mt-2" onclick="runJavaScriptCode(\'' + btoa(data.jsCode) + '\', \'' + btoa(data.jsHtmlCode || '') + '\')">' +
        '<i class="bi bi-play"></i> Test Function' +
        '</button>' +
        '</div>' +
        '<div class="code-suggestion">' +
        data.jsCode.split('\n').slice(0, 3).join('\n') + (data.jsCode.split('\n').length > 3 ? '\n...' : '') +
        '</div>' +
        '<div class="integration-steps">' +
        '<small><strong>Setup:</strong> 1) Add HTML structure 2) Include JS before &lt;/body&gt; 3) Test in console</small>' +
        '</div>' +
        '</div>';
    }

    function generateTemplateResponse(data) {
      return '<div class="code-response">' +
        '<div class="d-flex justify-content-between align-items-center mb-3">' +
        '<h6><i class="bi bi-palette"></i> ' + data.templateType.charAt(0).toUpperCase() + data.templateType.slice(1) + ' Template</h6>' +
        '<div>' +
        '<button class="btn btn-sm btn-outline-primary me-2" onclick="downloadTemplate(\'' + btoa(data.generatedHTML) + '\', \'' + btoa(data.generatedCSS) + '\', \'' + data.projectName + '\')">' +
        '<i class="bi bi-download"></i> Download' +
        '</button>' +
        '<button class="btn btn-sm btn-primary" onclick="previewTemplate(\'' + btoa(data.generatedHTML) + '\', \'' + btoa(data.generatedCSS) + '\')">' +
        '<i class="bi bi-eye"></i> Preview' +
        '</button>' +
        '</div>' +
        '</div>' +
        '<div class="live-preview-container">' +
        '<div class="preview-toolbar">' +
        '<span>Template Preview - ' + data.projectName + '</span>' +
        '<span class="badge bg-secondary">' + data.templateType + '</span>' +
        '</div>' +
        '<div style="background: white; min-height: 200px; overflow: hidden;">' +
        '<iframe srcdoc="' + data.generatedHTML.replace(/"/g, '&quot;') + '" style="width: 100%; height: 200px; border: none;"></iframe>' +
        '</div>' +
        '</div>' +
        '<div class="integration-steps mt-3">' +
        '<small><strong>Deployment:</strong> Download files → Upload to hosting → Customize content → Test responsive design</small>' +
        '</div>' +
        '</div>';
    }

    // Code tab switching
    function switchCodeTab(tabName) {
      // Hide all tab contents
      document.querySelectorAll('.code-tab-content').forEach(tab => {
        tab.style.display = 'none';
      });

      // Remove active class from all tabs
      document.querySelectorAll('.code-tab').forEach(tab => {
        tab.classList.remove('active');
      });

      // Show selected tab content
      const targetTab = document.getElementById(tabName + 'CodeTab') ||
        document.getElementById(tabName + 'Tab') ||
        document.getElementById(tabName.replace('-', '') + 'Tab');

      if (targetTab) {
        targetTab.style.display = 'block';
      }

      // Add active class to clicked tab
      // Use the event object passed as an argument
      if (typeof event !== 'undefined' && event.target) {
        event.target.classList.add('active');
      }

      // Update preview if preview tab is selected
      if (tabName === 'preview' || tabName === 'template-preview') {
        updateCodePreview();
      }
    }

    // Update live preview for HTML/CSS
    function updateCodePreview() {
      const htmlCode = document.getElementById('htmlCode');
      const customCSS = document.getElementById('customCSS');
      const preview = document.getElementById('codePreview');

      if (!htmlCode || !preview) return;
      const htmlContent = htmlCode.value.trim();
      const cssContent = customCSS ? customCSS.value.trim() : '';
    // Copy to clipboard function
    function copyToClipboard(content) {
      const text = atob(content);
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
          showToast('Code copied to clipboard!', 'success');
        }).catch(() => {
          showToast('Failed to copy code to clipboard.', 'danger');
        });
      } else {
        // fallback for insecure context or older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          showToast('Code copied to clipboard!', 'success');
        } catch (err) {
          showToast('Failed to copy code to clipboard.', 'danger');
        }
        document.body.removeChild(textArea);
      }
    }
      document.body.removeChild(textArea);
      showToast('Code copied to clipboard!', 'success');
    }
    // Run JavaScript code in the preview
    function runJavaScriptCode(jsCode, jsHtmlCode) {
      const code = atob(jsCode);
      const html = atob(jsHtmlCode || '');
      const preview = document.getElementById('codePreview');
      preview.innerHTML = html;
      const script = document.createElement('script');
      script.textContent = code;
      preview.appendChild(script);
      showToast('JavaScript code executed!', 'success');
    }
    // Show code modal for HTML/CSS
    function showCodeModal(title, htmlCode, cssCode) {
      const modal = document.getElementById('dynamicModal');
      modal.querySelector('.modal-title').textContent = title;
      modal.querySelector('.modal-body').innerHTML = `
                <pre class="code-block">${atob(htmlCode)}</pre>
                ${cssCode ? `<pre class="code-block">${atob(cssCode)}</pre>` : ''}
            `;
      const bsModal = new bootstrap.Modal(modal);
      bsModal.show();
    }
    // Download template files
    function downloadTemplate(htmlCode, cssCode, projectName) {
      const htmlContent = atob(htmlCode);
      const cssContent = atob(cssCode || '');
    // Preview template in a new tab
    function previewTemplate(htmlCode, cssCode) {
      const htmlContent = atob(htmlCode);
      const cssContent = atob(cssCode || '');
      const previewWindow = window.open('', '_blank');
      if (previewWindow) {
        previewWindow.document.body.innerHTML = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Template Preview</title>
              <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
              <style>${cssContent}</style>
          </head>
          <body>
              ${htmlContent}
          </body>
          </html>
        `;
        showToast('Template preview opened in new tab!', 'success');
      } else {
        showToast('Failed to open preview window.', 'danger');
      }
    }
      previewWindow.document.write(`<!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Template Preview</title>
                    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
                    <style>${cssContent}</style>
                </head>
                <body>
                    ${htmlContent}
                </body>
                </html>`);
      previewWindow.document.close();
      showToast('Template preview opened in new tab!', 'success');
    }
    // Initialize the app
    document.addEventListener('DOMContentLoaded', () => {
      loadData();
      updateStats();
      clearChat();
      document.getElementById('triggerInput').addEventListener('input', () => {
        const input = document.getElementById('triggerInput');
        if (input.value.trim()) {
          document.getElementById('addTriggerBtn').disabled = false;
        } else {
          document.getElementById('addTriggerBtn').disabled = true;
        }
      });
      document.getElementById('csvUpload').addEventListener('change', handleCSVUpload);
    // document.getElementById('csvDropZone').addEventListener('dragover', handleDragOver);
    //  document.getElementById('csvDropZone').addEventListener('dragleave', handleDragLeave);
    //  document.getElementById('csvDropZone').addEventListener('drop', handleDrop);
      document.getElementById('searchTriggers').addEventListener('input', filterTriggers);
   //   document.getElementById('addSampleDataBtn').addEventListener('click', addSampleData);
    //  document.getElementById('validateBotBtn').addEventListener('click', validateBot);
    //  document.getElementById('showStatsBtn').addEventListener('click', showStats);
    //  document.getElementById('optimizeBotBtn').addEventListener('click', optimizeBot);
    //  document.getElementById('exportDataBtn').addEventListener('click', exportData);
     // document.getElementById('importDataBtn').addEventListener('click', importData);
    //  document.getElementById('clearAllDataBtn').addEventListener('click', clearAllData);
     // document.getElementById('scrollToTopBtn').addEventListener('click', scrollToTop);
    //  document.getElementById('sendPreviewMessageBtn').addEventListener('click', sendPreviewMessage);
    //  document.getElementById('clearChatBtn').addEventListener('click', clearChat);
      document.getElementById('previewInput').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          sendPreviewMessage();
        }
      });
      document.querySelectorAll('.code-tab').forEach(tab => {
        tab.addEventListener('click', function (e) {
          e.preventDefault();
          switchCodeTab(this.getAttribute('data-tab'));
        });
      });
      // Initialize the first tab
      const firstTab = document.querySelector('.code-tab');
      if (firstTab) {
        firstTab.classList.add('active');
        const firstTabName = firstTab.getAttribute('data-tab');
        switchCodeTab(firstTabName);
      }
    });

    // ========================================
    // Bootstrap tooltips initialization
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach(tooltipTriggerEl => {
      new bootstrap.Tooltip(tooltipTriggerEl);
    });