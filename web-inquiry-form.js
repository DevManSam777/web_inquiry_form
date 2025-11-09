class WebInquiryForm extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.currentStep = 0;
    this.totalSteps = 5; // Steps 0, 1, 2, 3, 4
    this.completedSteps = new Set();
    this.googleFontLoaded = false;
  }

  static get observedAttributes() {
    return [
      "theme",
      "primary-color",
      "background-color",
      "text-color",
      "border-color",
      "border-radius",
      "font-family",
      "font-size",
      "google-font",
      "api-url",
      "dark-primary-color",
      "dark-background-color",
      "dark-text-color",
      "dark-border-color",
      "form-title",
      "input-background-color",
      "input-text-color",
      "input-border-color",
      "fieldset-background-color",
      "success-color",
      "error-color",
      "progress-color",
      "dark-input-background-color",
      "dark-input-text-color",
      "dark-input-border-color",
      "dark-fieldset-background-color",
      "dark-success-color",
      "dark-error-color",
      "dark-progress-color",
    ];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    if (name === "theme") {
      this.updateTheme();
    } else if (name === "google-font") {
      // When google-font changes, reset the loaded flag and re-load/update
      this.googleFontLoaded = false;
      this.loadGoogleFont().then(() => {
        this.updateStyles();
      });
    } else {
      // Re-render styles for other attribute changes
      this.updateStyles();
    }
  }

  connectedCallback() {
    // Render the initial structure immediately
    this.render();

    // Load Google Font and then update styles
    this.loadGoogleFont().then(() => {
      this.updateStyles();
    });

    this.initializeEvents();
    this.updateTheme();
    this.setupThemeWatchers();
    this.updateProgress();
  }

  disconnectedCallback() {
    if (this.themeMediaQuery) {
      this.themeMediaQuery.removeEventListener(
        "change",
        this.handleSystemThemeChange
      );
    }
    if (this.themeObserver) {
      this.themeObserver.disconnect();
    }
  }

  loadGoogleFont() {
    return new Promise((resolve) => {
      const googleFont = this.getAttribute("google-font");

      if (!googleFont) {
        this.googleFontLoaded = false;
        resolve();
        return;
      }

      const existingLink = document.head.querySelector(
        `link[href*="fonts.googleapis.com"][href*="${googleFont.replace(
          /\s+/g,
          "+"
        )}"]`
      );
      if (existingLink) {
        this.googleFontLoaded = true;
        resolve();
        return;
      }

      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${googleFont.replace(
        /\s+/g,
        "+"
      )}:wght@400;500;600&display=swap`;

      link.onload = () => {
        this.googleFontLoaded = true;
        resolve();
      };

      link.onerror = () => {
        console.warn(`Failed to load Google Font: ${googleFont}`);
        this.googleFontLoaded = false;
        resolve();
      };

      document.head.appendChild(link);
    });
  }

  setupThemeWatchers() {
    this.themeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    this.handleSystemThemeChange = () => {
      if (!this.getAttribute("theme")) {
        this.updateTheme();
      }
    };
    this.themeMediaQuery.addEventListener(
      "change",
      this.handleSystemThemeChange
    );

    this.themeObserver = new MutationObserver(() => {
      if (!this.getAttribute("theme")) {
        this.updateTheme();
      }
    });

    this.themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "class"],
    });

    this.themeObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-theme", "class"],
    });
  }

  updateTheme() {
    const container = this.shadowRoot.querySelector(".form-container");
    if (!container) return;

    const explicitTheme = this.getAttribute("theme");

    let isDark = false;

    if (explicitTheme) {
      isDark = explicitTheme === "dark";
    } else {
      isDark = this.detectDarkMode();
    }

    if (isDark) {
      container.classList.add("dark-mode");
    } else {
      container.classList.remove("dark-mode");
    }
  }

  detectDarkMode() {
    const html = document.documentElement;
    const body = document.body;

    const dataTheme =
      html.getAttribute("data-theme") || body.getAttribute("data-theme");
    if (dataTheme === "dark") return true;
    if (dataTheme === "light") return false;

    if (html.classList.contains("dark") || body.classList.contains("dark"))
      return true;
    if (
      html.classList.contains("dark-mode") ||
      body.classList.contains("dark-mode")
    )
      return true;
    if (
      html.classList.contains("theme-dark") ||
      body.classList.contains("theme-dark")
    )
      return true;

    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  getFontFamily() {
    const googleFont = this.getAttribute("google-font");
    const customFontFamily = this.getAttribute("font-family");

    if (googleFont && this.googleFontLoaded) {
      return `"${googleFont}", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    } else if (customFontFamily) {
      return customFontFamily;
    } else {
      return '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    }
  }

  get styles() {
    const primaryColor = this.getAttribute("primary-color") || "#3498db";
    const backgroundColor = this.getAttribute("background-color") || "#ffffff";
    const textColor = this.getAttribute("text-color") || "#333333";
    const borderColor = this.getAttribute("border-color") || "#aaaaaa";
    const borderRadius = this.getAttribute("border-radius") || "6px";
    const fontFamily = this.getFontFamily();
    const fontSize = this.getAttribute("font-size") || "16px";

    // Enhanced input styling
    const inputBackgroundColor =
      this.getAttribute("input-background-color") || backgroundColor;
    const inputTextColor = this.getAttribute("input-text-color") || textColor;
    const inputBorderColor =
      this.getAttribute("input-border-color") || borderColor;

    // Enhanced fieldset styling
    const fieldsetBackgroundColor =
      this.getAttribute("fieldset-background-color") || backgroundColor;

    // Enhanced status colors
    const successColor = this.getAttribute("success-color") || "#4caf50";
    const errorColor = this.getAttribute("error-color") || "#d32f2f";
    const progressColor = this.getAttribute("progress-color") || primaryColor;

    // Dark mode variants
    const darkPrimaryColor =
      this.getAttribute("dark-primary-color") || "#60a5fa";
    const darkBackgroundColor =
      this.getAttribute("dark-background-color") || "#1e2026";
    const darkTextColor = this.getAttribute("dark-text-color") || "#e9ecef";
    const darkBorderColor = this.getAttribute("dark-border-color") || "#495057";

    const darkInputBackgroundColor =
      this.getAttribute("dark-input-background-color") || darkBackgroundColor;
    const darkInputTextColor =
      this.getAttribute("dark-input-text-color") || darkTextColor;
    const darkInputBorderColor =
      this.getAttribute("dark-input-border-color") || darkBorderColor;
    const darkFieldsetBackgroundColor =
      this.getAttribute("dark-fieldset-background-color") ||
      darkBackgroundColor;
    const darkSuccessColor =
      this.getAttribute("dark-success-color") || "#4ade80";
    const darkErrorColor = this.getAttribute("dark-error-color") || "#f87171";
    const darkProgressColor =
      this.getAttribute("dark-progress-color") || darkPrimaryColor;

    return `
      :host {
        display: block;
        font-family: ${fontFamily};
        line-height: 1.6;
        color: ${textColor};
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        font-size: ${fontSize};
      }
      
      .form-container {
        background-color: ${backgroundColor}; 
        padding: 30px;
        border-radius: ${borderRadius};
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        font-family: ${fontFamily};
      }
      
      .form-header {
        color: ${textColor};
        margin-bottom: 30px;
        text-align: center;
      }

      .form-header h1 {
        font-size: calc(${fontSize} * 1.5);
        line-height: 1;
        margin-bottom: -8px;
        font-family: ${fontFamily};
      }

      .form-header p {
        font-size: calc(${fontSize} * 0.875);
        opacity: 0.8;
        font-family: ${fontFamily};
      }

      .progress-section {
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 1px solid ${borderColor};
      }

      .progress-bar {
        width: 100%;
        height: 6px;
        background: rgba(${this.hexToRgb(progressColor)}, 0.1);
        border-radius: calc(${borderRadius} / 2);
        overflow: hidden;
        margin-bottom: 15px;
      }

      .progress-fill {
        height: 100%;
        background: ${progressColor};
        border-radius: calc(${borderRadius} / 2);
        transition: width 0.3s ease;
        width: 0%;
      }

      .step-indicators {
        display: flex;
        justify-content: space-between;
        font-size: calc(${fontSize} * 0.875);
        padding: 0 5px;
        font-family: ${fontFamily};
      }

      .step-indicator {
        display: flex;
        align-items: center;
        color: ${textColor};
        opacity: 0.6;
      }

      .step-indicator.active {
        color: ${progressColor};
        font-weight: 600;
        opacity: 1;
      }

      .step-indicator.completed {
        color: ${successColor};
        opacity: 1;
      }

      .step-dot {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: ${borderColor};
        color: ${textColor};
        margin-right: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: calc(${fontSize} * 0.6875);
        font-weight: bold;
        font-family: ${fontFamily};
      }

      .step-indicator.active .step-dot {
        background: ${progressColor};
        color: white;
      }

      .step-indicator.completed .step-dot {
        background: ${successColor};
        color: white;
      }

      .section {
        display: none;
      }

      .section.active {
        display: block;
      }

      .section-content {
        border: none;
        border-radius: 0;
        padding: 0;
        margin-bottom: 0;
        background-color: transparent;
        position: relative;
      }

      fieldset {
        border: 1px solid ${borderColor};
        border-radius: ${borderRadius};
        padding: 20px;
        margin-bottom: 25px;
        background-color: ${fieldsetBackgroundColor};
        filter: brightness(0.98);
      }

      legend {
        font-size: calc(${fontSize} * 1.125);
        font-weight: bold;
        color: ${textColor};
        padding: 0 10px;
        font-family: ${fontFamily};
      }

      .section-subtitle {
        color: ${textColor};
        opacity: 0.7;
        font-size: ${fontSize};
        text-align: center;
        margin-top: -10px;
        font-family: ${fontFamily};
      }

      .form-group {
        margin: 0 0 20px 0;
      }

      .form-group label {
        display: block;
        margin-bottom: 8px;
        font-weight: 600;
        font-size: ${fontSize};
        color: ${textColor};
        font-family: ${fontFamily};
      }

      .form-group input[type="text"],
      .form-group input[type="email"],
      .form-group input[type="tel"],
      .form-group textarea,
      .form-group select {
        width: 100%;
        padding: 10px;
        border: 2px solid ${inputBorderColor};
        border-radius: ${borderRadius};
        box-sizing: border-box;
        transition: border-color 0.3s, background-color 0.3s;
        background-color: ${inputBackgroundColor};
        color: ${inputTextColor};
        font-size: ${fontSize};
        font-family: ${fontFamily};
      }

      .form-group textarea {
        resize: vertical;
        min-height: 80px;
      }

      .form-group input[type="text"]:focus,
      .form-group input[type="email"]:focus,
      .form-group input[type="tel"]:focus,
      .form-group textarea:focus,
      .form-group select:focus {
        outline: none;
        border-color: ${primaryColor};
        box-shadow: 0 0 3px rgba(52, 152, 219, 0.3);
      }

      .required::after {
        content: "*";
        color: #e74c3c;
        margin-left: 4px;
      }

      .radio-group {
        margin-top: 10px;
      }

      .radio-option {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
        width: 100%;
      }

      .radio-option input[type="radio"] {
        width: auto;
        margin-right: 8px;
        margin-bottom: 0;
        flex-shrink: 0;
      }

      .radio-option label {
        margin: 0;
        font-weight: normal;
        cursor: pointer;
        width: auto;
        flex: none;
        color: ${textColor};
        font-family: ${fontFamily};
      }

      .extension-option {
        margin-top: 15px;
        padding: 15px;
      }

      .checkbox-wrapper {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
      }

      .checkbox-wrapper input[type="checkbox"] {
        width: auto;
        margin-right: 8px;
      }

      .checkbox-wrapper label {
        margin: 0;
        font-weight: normal;
        color: ${textColor};
        font-family: ${fontFamily};
      }

      .conditional-field {
        display: none;
        margin-top: 10px;
      }

      .conditional-field.show {
        display: block;
      }

      .address-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
        margin-bottom: 20px;
      }

      .address-row .form-group {
        margin-bottom: 0;
      }

      .navigation {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid ${borderColor};
      }

      .btn {
        padding: 12px 20px;
        border: none;
        border-radius: ${borderRadius};
        font-size: ${fontSize};
        font-family: ${fontFamily};
        cursor: pointer;
        transition: background-color 0.3s, opacity 0.2s ease;
        min-width: 120px;
      }

      .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .btn-secondary {
        background-color: #6c757d;
        color: white;
      }

      .btn-secondary:hover:not(:disabled) {
        background-color: #5a6268;
      }

      .btn-primary {
        background-color: ${primaryColor};
        color: white;
      }

      .btn-primary:hover:not(:disabled) {
        opacity: 0.9;
      }

      .error-message {
        color: ${errorColor};
        font-size: calc(${fontSize} * 0.75);
        margin-top: 4px;
        font-weight: 500;
        font-family: ${fontFamily};
      }

      .invalid {
        border: 2px solid ${errorColor} !important;
        background-color: rgba(${this.hexToRgb(errorColor)}, 0.05);
      }

      .radio-option input[type="radio"].invalid {
        border: 2px solid ${errorColor};
        box-shadow: 0 0 3px rgba(${this.hexToRgb(errorColor)}, 0.3);
      }

      .valid {
        border-color: ${successColor} !important;
        background-color: rgba(${this.hexToRgb(successColor)}, 0.05);
      }

      .toast {
        position: fixed;
        bottom: 350px;
        right: 20px;
        background: ${successColor};
        color: white;
        padding: 15px 20px;
        border-radius: ${borderRadius};
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        transform: translateX(100%);
        transition: transform 0.3s ease, opacity 0.3s ease;
        opacity: 1;
        font-family: ${fontFamily};
        font-size: calc(${fontSize} * 0.875);
        font-weight: 500;
        min-width: 200px;
        max-width: 400px;
        word-wrap: break-word;
        display: block;
      }

      .toast.show {
        transform: translateX(0);
      }

      .toast.hide {
        opacity: 0;
        transform: translateX(100%);
      }

      .toast.error {
        background: ${errorColor};
      }

      /* Review Section */
      .review-container {
        display: grid;
        gap: 20px;
      }

      .review-section {
        background: ${fieldsetBackgroundColor};
        filter: brightness(0.98);
        border-radius: ${borderRadius};
        padding: 20px;
        border: 1px solid ${borderColor};
      }

      .review-section h3 {
        color: ${textColor};
        font-size: ${fontSize};
        font-weight: 600;
        margin-bottom: 15px;
        border-bottom: 1px solid ${borderColor};
        padding-bottom: 8px;
        font-family: ${fontFamily};
      }

      .review-item {
        display: grid;
        grid-template-columns: 160px 1fr;
        gap: 12px;
        margin-bottom: 8px;
        align-items: start;
      }

      .review-label {
        font-weight: 500;
        color: ${textColor};
        opacity: 0.8;
        font-size: ${fontSize};
        font-family: ${fontFamily};
      }

      .review-value {
        color: ${textColor};
        word-break: break-word;
        font-size: ${fontSize};
        font-family: ${fontFamily};
      }

      .review-value.empty {
        color: ${textColor};
        opacity: 0.5;
        font-style: italic;
      }

      .edit-step-btn {
        background: none;
        border: 1px solid ${primaryColor};
        color: ${primaryColor};
        padding: 6px 12px;
        border-radius: ${borderRadius};
        font-size: calc(${fontSize} * 0.875);
        font-family: ${fontFamily};
        cursor: pointer;
        transition: all 0.2s ease;
        margin-top: 10px;
      }

      .edit-step-btn:hover {
        background: ${primaryColor};
        color: white;
      }

      /* Dark Mode */
      .form-container.dark-mode {
        background-color: ${darkBackgroundColor};
        color: ${darkTextColor};
      }

      .dark-mode fieldset {
        background-color: ${darkFieldsetBackgroundColor};
        filter: brightness(1.1);
        border-color: ${darkBorderColor};
      }

      .dark-mode legend {
        color: ${darkTextColor};
      }

      .dark-mode .progress-section {
        border-bottom-color: ${darkBorderColor};
      }

      .dark-mode .form-header {
        color: ${darkTextColor};
      }

      .dark-mode .form-header h1 {
        color: ${darkTextColor};
      }

      .dark-mode .section-subtitle {
        color: ${darkTextColor};
      }

      .dark-mode .form-group label {
        color: ${darkTextColor};
      }

      .dark-mode .step-indicator {
        color: ${darkTextColor};
      }

      .dark-mode .step-indicator.active {
        color: ${darkProgressColor};
      }

      .dark-mode .step-indicator.completed {
        color: ${darkSuccessColor};
      }

      .dark-mode .step-dot {
        background: ${darkBorderColor};
        color: ${darkTextColor};
      }

      .dark-mode .step-indicator.active .step-dot {
        background: ${darkProgressColor};
        color: white;
      }

      .dark-mode .step-indicator.completed .step-dot {
        background: ${darkSuccessColor};
        color: white;
      }

      .dark-mode .progress-fill {
        background: ${darkProgressColor};
      }

      .dark-mode .progress-bar {
        background: rgba(${this.hexToRgb(darkProgressColor)}, 0.1);
      }

      .dark-mode .form-group input[type="text"],
      .dark-mode .form-group input[type="email"],
      .dark-mode .form-group input[type="tel"],
      .dark-mode .form-group textarea,
      .dark-mode .form-group select {
        background-color: ${darkInputBackgroundColor};
        filter: brightness(1.1);
        color: ${darkInputTextColor};
        border-color: ${darkInputBorderColor};
      }

      .dark-mode .form-group input[type="text"]:focus,
      .dark-mode .form-group input[type="email"]:focus,
      .dark-mode .form-group input[type="tel"]:focus,
      .dark-mode .form-group textarea:focus,
      .dark-mode .form-group select:focus {
        border-color: ${darkPrimaryColor};
        box-shadow: 0 0 3px rgba(96, 165, 250, 0.3);
      }

      .dark-mode .radio-option label {
        color: ${darkTextColor};
      }

      .dark-mode .checkbox-wrapper label {
        color: ${darkTextColor};
      }

      .dark-mode .navigation {
        border-top-color: ${darkBorderColor};
      }

      .dark-mode .btn-primary {
        background-color: ${darkPrimaryColor};
      }

      .dark-mode .review-section {
        background-color: ${darkFieldsetBackgroundColor};
        filter: brightness(1.1);
        border-color: ${darkBorderColor};
      }

      .dark-mode .review-section h3 {
        color: ${darkTextColor};
        border-bottom-color: ${darkBorderColor};
      }

      .dark-mode .review-label {
        color: ${darkTextColor};
      }

      .dark-mode .review-value {
        color: ${darkTextColor};
      }

      .dark-mode .review-value.empty {
        color: ${darkTextColor};
        opacity: 0.5;
      }

      .dark-mode .edit-step-btn {
        border-color: ${darkPrimaryColor};
        color: ${darkPrimaryColor};
      }

      .dark-mode .edit-step-btn:hover {
        background: ${darkPrimaryColor};
        color: white;
      }

      .dark-mode .toast {
        background: ${darkSuccessColor};
      }

      .dark-mode .toast.error {
        background: ${darkErrorColor};
      }

      .dark-mode .error-message {
        color: ${darkErrorColor};
      }

      .dark-mode .invalid {
        border-color: ${darkErrorColor} !important;
        background-color: rgba(${this.hexToRgb(darkErrorColor)}, 0.05);
      }

      .dark-mode .radio-option input[type="radio"].invalid {
        border: 2px solid ${darkErrorColor};
        box-shadow: 0 0 3px rgba(${this.hexToRgb(darkErrorColor)}, 0.3);
      }

      .dark-mode .valid {
        border-color: ${darkSuccessColor} !important;
        background-color: rgba(${this.hexToRgb(successColor)}, 0.05);
      }

      /* Responsive */
      @media (max-width: 768px) {
        :host {
          padding: 10px;
          max-width: 600px;
        }

        .form-container {
          padding: 20px;
        }

        .form-header h1 {
          font-size: calc(${fontSize} * 1.25);
        }

        fieldset {
          padding: 15px;
        }

        legend {
          font-size: ${fontSize};
        }

        .form-group label {
          font-size: calc(${fontSize} * 0.875);
        }

        .step-indicators {
          font-size: calc(${fontSize} * 0.75);
        }

        .step-indicator span {
          display: none;
        }

        .review-item {
          grid-template-columns: 1fr;
          gap: 4px;
        }

        .review-label {
          font-weight: 600;
        }

        .review-section h3 {
          font-size: ${fontSize};
        }

        .review-label {
          font-size: calc(${fontSize} * 0.875);
        }

        .review-value {
          font-size: calc(${fontSize} * 0.875);
        }
      }

      @media (max-width: 480px) {
        :host {
          padding: 5px;
          max-width: 600px;
        }

        .form-container {
          padding: 15px;
        }

        .form-header h1 {
          font-size: calc(${fontSize} * 1.125);
        }

        .form-header p {
          font-size: calc(${fontSize} * 0.75);
        }

        fieldset {
          padding: 10px;
        }

        legend {
          font-size: calc(${fontSize} * 0.875);
        }

        .section-subtitle {
          font-size: calc(${fontSize} * 0.75);
        }

        .form-group label {
          font-size: calc(${fontSize} * 0.75);
        }

        .address-row {
          grid-template-columns: 1fr;
        }

        .step-indicators {
          font-size: calc(${fontSize} * 0.625);
        }

        .btn {
          font-size: calc(${fontSize} * 0.875);
          padding: 10px 16px;
          min-width: 100px;
        }

        .review-section h3 {
          font-size: calc(${fontSize} * 0.875);
        }

        .review-label {
          font-size: calc(${fontSize} * 0.75);
        }

        .review-value {
          font-size: calc(${fontSize} * 0.75);
        }

        .edit-step-btn {
          font-size: calc(${fontSize} * 0.75);
          padding: 4px 8px;
        }
      }
    `;
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(
          result[3],
          16
        )}`
      : "0, 0, 0";
  }

  updateStyles() {
    const styleTag = this.shadowRoot.querySelector("style");
    if (styleTag) {
      styleTag.textContent = this.styles;
    }
  }

  render() {
    if (!this.shadowRoot.querySelector("style")) {
      const styleTag = document.createElement("style");
      this.shadowRoot.appendChild(styleTag);
    }

    this.shadowRoot.innerHTML = `
      ${this.shadowRoot.querySelector("style").outerHTML}

      <div class="form-container">
        <div class="form-header">
          <h1>${
            this.getAttribute("form-title") || "Web Development Inquiry"
          }</h1>
        </div>

        <div class="progress-section">
          <div class="progress-bar">
            <div class="progress-fill"></div>
          </div>
          <div class="step-indicators">
            <div class="step-indicator active" data-step="0">
              <div class="step-dot">1</div>
               <span>Personal</span>
            </div>
            <div class="step-indicator" data-step="1">
              <div class="step-dot">2</div>
               <span>Business</span>
            </div>
            <div class="step-indicator" data-step="2">
              <div class="step-dot">3</div>
              <span>Address</span>
            </div>
            <div class="step-indicator" data-step="3">
              <div class="step-dot">4</div>
               <span>Service</span>
            </div>
            <div class="step-indicator" data-step="4">
              <div class="step-dot">5</div>
               <span>Review</span>
            </div>
          </div>
        </div>

        <form id="inquiry-form">
          <!-- Step 1: Personal Information -->
          <div class="section active" data-step="0">
            <fieldset>
              <legend>Personal Information</legend>
              <p class="section-subtitle">Tell us about yourself!</p>

              <div class="address-row">
                <div class="form-group">
                  <label for="firstName" class="required">First Name</label>
                  <input type="text" id="firstName" name="firstName" required />
                </div>

                <div class="form-group">
                  <label for="lastName" class="required">Last Name</label>
                  <input type="text" id="lastName" name="lastName" required />
                </div>
              </div>

              <div class="form-group">
                <label for="email" class="required">Email Address</label>
                <input type="email" id="email" name="email" required />
              </div>

              <div class="form-group">
                <label for="phone" class="required">Phone Number</label>
                <input type="tel" id="phone" name="phone" required />
                
                <div class="extension-option">
                  <div class="checkbox-wrapper">
                    <input type="checkbox" id="phoneExtCheck" name="phoneExtCheck" />
                    <label for="phoneExtCheck">Add Extension</label>
                  </div>
                  <div class="conditional-field" id="phoneExtField">
                    <div class="form-group">
                      <label for="phoneExt">Extension</label>
                      <input type="text" id="phoneExt" name="phoneExt" />
                    </div>
                  </div>
                </div>
              </div>

            </fieldset>
          </div>

          <!-- Step 2: Business Information (ADDED) -->
          <div class="section" data-step="1">
            <fieldset>
              <legend>Business Information</legend>
              <p class="section-subtitle">Tell us about your business.</p>

              <div class="form-group">
                <label for="businessName">Business Name</label>
                <input type="text" id="businessName" name="businessName" />
              </div>

              <div class="form-group">
                <label for="businessPhone">Business Phone Number</label>
                <input type="tel" id="businessPhone" name="businessPhone" />
                <div class="extension-option">
                  <div class="checkbox-wrapper">
                    <input type="checkbox" id="businessPhoneExtCheck" name="businessPhoneExtCheck" />
                    <label for="businessPhoneExtCheck">Add Extension</label>
                  </div>
                  <div class="conditional-field" id="businessPhoneExtField">
                    <div class="form-group">
                      <label for="businessPhoneExt">Extension</label>
                      <input type="text" id="businessPhoneExt" name="businessPhoneExt" />
                    </div>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label for="businessEmail">Business Email</label>
                <input type="email" id="businessEmail" name="businessEmail" />
              </div>

              <div class="form-group">
                <label for="businessServices">Type of Business/Services</label>
                <textarea id="businessServices" name="businessServices" placeholder="e.g., Web Design, Marketing, Consulting"></textarea>
              </div>
            </fieldset>
          </div>

          <!-- Step 3: Mailing Address -->
          <div class="section" data-step="2">
            <fieldset>
              <legend>Mailing Address</legend>
              <p class="section-subtitle">What is your mailing address?</p>

              <div class="form-group">
                <label for="billingStreet" class="required">Street Address</label>
                <input type="text" id="billingStreet" name="billingStreet" required />
              </div>

              <div class="address-row">
                <div class="form-group">
                  <label for="billingAptUnit">Apartment/Unit Number</label>
                  <input type="text" id="billingAptUnit" name="billingAptUnit" />
                </div>

                <div class="form-group">
                  <label for="billingCity" class="required">City</label>
                  <input type="text" id="billingCity" name="billingCity" required />
                </div>
              </div>

              <div class="address-row">
                <div class="form-group">
                  <label for="billingState" class="required">State/Province</label>
                  <input type="text" id="billingState" name="billingState" required />
                </div>
                <div class="form-group">
                  <label for="billingZipCode" class="required">ZIP/Postal Code</label>
                  <input type="text" id="billingZipCode" name="billingZipCode" required />
                </div>
              </div>

              <div class="form-group">
                <label for="billingCountry" class="required">Country</label>
                <input type="text" id="billingCountry" name="billingCountry" value="USA" required />
              </div>
            </fieldset>
          </div>

          <!-- Step 4: Service Details -->
          <div class="section" data-step="3">
            <fieldset>
              <legend>Service Details</legend>
              <p class="section-subtitle">What can we help you with?</p>

              <div class="form-group">
                <label class="required">Preferred Contact Method</label>
                <div class="radio-group">
                  <div class="radio-option">
                    <input type="radio" id="contactPhone" name="preferredContact" value="phone" required />
                    <label for="contactPhone">Phone</label>
                  </div>
                  <div class="radio-option">
                    <input type="radio" id="contactEmail" name="preferredContact" value="email" />
                    <label for="contactEmail">Email</label>
                  </div>
                  <div class="radio-option">
                    <input type="radio" id="contactText" name="preferredContact" value="text" />
                    <label for="contactText">Text</label>
                  </div>
                  <div class="radio-option">
                    <input type="radio" id="contactBusinessPhone" name="preferredContact" value="businessPhone" />
                    <label for="contactBusinessPhone">Business Phone</label>
                  </div>
                  <div class="radio-option">
                    <input type="radio" id="contactBusinessEmail" name="preferredContact" value="businessEmail" />
                    <label for="contactBusinessEmail">Business Email</label>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label class="required">Service Desired</label>
                <div class="radio-group">
                  <div class="radio-option">
                    <input type="radio" id="serviceWebsite" name="serviceDesired" value="Web Development" required />
                    <label for="serviceWebsite">Website</label>
                  </div>
                  <div class="radio-option">
                    <input type="radio" id="serviceApp" name="serviceDesired" value="App Development" />
                    <label for="serviceApp">App Development</label>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label>Do you currently have a website?</label>
                <div class="radio-group">
                  <div class="radio-option">
                    <input type="radio" id="websiteYes" name="hasWebsite" value="yes" />
                    <label for="websiteYes">Yes</label>
                  </div>
                  <div class="radio-option">
                    <input type="radio" id="websiteNo" name="hasWebsite" value="no" />
                    <label for="websiteNo">No</label>
                  </div>
                </div>

                <div class="conditional-field" id="websiteAddressField">
                  <div class="form-group">
                    <label for="websiteAddress">Website Address</label>
                    <input type="text" id="websiteAddress" name="websiteAddress" placeholder="example.com" />
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label for="message">Message</label>
                <textarea id="message" name="message" placeholder="Your message..."></textarea>
              </div>
            </fieldset>
          </div>

          <!-- Step 5: Review -->
          <div class="section" data-step="4">
            <fieldset>
              <legend>Review Your Information</legend>
              <p class="section-subtitle">Please review your details before submitting</p>

              <div class="review-container" id="reviewContainer">
                <!-- Review content will be populated here -->
              </div>
            </fieldset>
          </div>

          <div class="navigation">
            <button type="button" class="btn btn-secondary" id="prevBtn" style="visibility: hidden;">Previous</button>
            <button type="button" class="btn btn-primary" id="nextBtn">Next</button>
            <button type="submit" class="btn btn-primary" id="submitBtn" style="display: none;">Submit Inquiry</button>
          </div>
        </form>
      </div>
    `;
    this.updateStyles();
  }

  initializeEvents() {
    const form = this.shadowRoot.getElementById("inquiry-form");
    const nextBtn = this.shadowRoot.getElementById("nextBtn");
    const prevBtn = this.shadowRoot.getElementById("prevBtn");
    const submitBtn = this.shadowRoot.getElementById("submitBtn");

    // Initialize phone formatting
    this.loadCleavejs().then(() => {
      this.initializePhoneFormatting();
    });

    // Initialize conditional fields
    this.initializeConditionalFields();

    // Initialize validation
    this.initializeValidation();

    // Navigation events
    nextBtn.addEventListener("click", () => this.nextStep());
    prevBtn.addEventListener("click", () => this.prevStep());

    // Prevent premature form submission on Enter key
    form.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();

        // If we're on the last step (review), allow submission
        if (this.currentStep === this.totalSteps - 1) {
          // Call handleFormSubmit directly - NO untrusted events
          this.handleFormSubmit(e);
        } else {
          // Otherwise, try to go to next step
          this.nextStep();
        }
      }
    });

    // Form submission - IMPORTANT: Remove the form submit event listener entirely for Firefox
    const isFirefox = navigator.userAgent.toLowerCase().includes("firefox");
    console.log(
      "Browser detected:",
      isFirefox ? "Firefox" : "Other",
      navigator.userAgent
    );

    if (!isFirefox) {
      // Only add form submit listener for non-Firefox browsers
      form.addEventListener("submit", this.handleFormSubmit.bind(this));
    }

    // Submit button - always call directly
    submitBtn.addEventListener("click", (e) => {
      e.preventDefault();
      console.log("Submit button clicked, calling handleFormSubmit directly");
      this.handleFormSubmit(e);
    });

    // Validate current step on input
    form.addEventListener("input", (e) => {
      // Clear validation errors as user types
      if (e.target.classList.contains("invalid")) {
        this.removeError(e.target);
      }
      this.validateCurrentStep();
    });
    form.addEventListener("change", (e) => {
      // Clear validation errors when radio buttons are selected
      if (e.target.type === "radio" && e.target.classList.contains("invalid")) {
        const radioGroup = e.target.closest('.form-group');
        const allRadiosInGroup = radioGroup.querySelectorAll(`input[name="${e.target.name}"]`);
        allRadiosInGroup.forEach(radio => {
          radio.classList.remove("invalid");
        });
        const errorMsg = radioGroup.querySelector('.error-message');
        if (errorMsg) {
          errorMsg.remove();
        }
      }
      this.validateCurrentStep();
    });
  }

  loadCleavejs() {
    return new Promise((resolve, reject) => {
      if (window.Cleave) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src =
        "https://cdn.jsdelivr.net/npm/cleave.js@1.6.0/dist/cleave.min.js";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Cleave.js"));
      document.head.appendChild(script);
    });
  }

  initializePhoneFormatting() {
    const phoneInputs = this.shadowRoot.querySelectorAll('input[type="tel"]');

    if (window.Cleave) {
      phoneInputs.forEach((input) => {
        new window.Cleave(input, {
          numericOnly: true,
          blocks: [3, 3, 4],
          delimiters: ["-", "-"],
        });
      });
    }
  }

  initializeConditionalFields() {
    // Phone extension
    const phoneExtCheck = this.shadowRoot.getElementById("phoneExtCheck");
    const phoneExtField = this.shadowRoot.getElementById("phoneExtField");

    phoneExtCheck.addEventListener("change", function () {
      if (this.checked) {
        phoneExtField.classList.add("show");
      } else {
        phoneExtField.classList.remove("show");
        phoneExtField.querySelector("input").value = "";
      }
    });

    // Business phone extension
    const businessPhoneExtCheck = this.shadowRoot.getElementById(
      "businessPhoneExtCheck"
    );
    const businessPhoneExtField = this.shadowRoot.getElementById(
      "businessPhoneExtField"
    );

    businessPhoneExtCheck.addEventListener("change", function () {
      if (this.checked) {
        businessPhoneExtField.classList.add("show");
      } else {
        businessPhoneExtField.classList.remove("show");
        businessPhoneExtField.querySelector("input").value = "";
      }
    });

    // Website address
    const websiteYes = this.shadowRoot.getElementById("websiteYes");
    const websiteNo = this.shadowRoot.getElementById("websiteNo");
    const websiteAddressField = this.shadowRoot.getElementById(
      "websiteAddressField"
    );

    websiteYes.addEventListener("change", function () {
      if (this.checked) {
        websiteAddressField.classList.add("show");
      }
    });

    websiteNo.addEventListener("change", function () {
      if (this.checked) {
        websiteAddressField.classList.remove("show");
        websiteAddressField.querySelector("input").value = "";
      }
    });
  }

  initializeValidation() {
    const form = this.shadowRoot.getElementById("inquiry-form");

    // Real-time validation
    const inputs = form.querySelectorAll("input, textarea");
    inputs.forEach((input) => {
      input.addEventListener("blur", () => this.validateField(input));
      input.addEventListener("input", () => {
        if (input.classList.contains("invalid")) {
          this.validateField(input);
        }
      });
    });
  }

  validateCurrentStep() {
    const currentSection = this.shadowRoot.querySelector(
      `.section[data-step="${this.currentStep}"]`
    );
    const nextBtn = this.shadowRoot.getElementById("nextBtn");

    if (!currentSection) return true;

    let isValid = true;

    // Check required fields
    const requiredFields = currentSection.querySelectorAll(
      'input[required]:not([type="radio"]), textarea[required]'
    );
    requiredFields.forEach((field) => {
      if (!field.value.trim()) {
        isValid = false;
      }
    });

    // Check required radio groups - find groups that have at least one required radio
    const allRadios = currentSection.querySelectorAll('input[type="radio"]');
    const radioGroups = {};

    // Collect all radio groups and check if any in the group is required
    allRadios.forEach((radio) => {
      if (!radioGroups[radio.name]) {
        radioGroups[radio.name] = {
          hasRequired: false,
          isChecked: false,
        };
      }
      if (radio.required) {
        radioGroups[radio.name].hasRequired = true;
      }
      if (radio.checked) {
        radioGroups[radio.name].isChecked = true;
      }
    });

    // Validate required radio groups
    Object.values(radioGroups).forEach((group) => {
      if (group.hasRequired && !group.isChecked) {
        isValid = false;
      }
    });

    nextBtn.disabled = !isValid;
    return isValid;
  }

  showValidationErrors() {
    const currentSection = this.shadowRoot.querySelector(
      `.section[data-step="${this.currentStep}"]`
    );

    if (!currentSection) return;

    // Validate required input fields
    const requiredFields = currentSection.querySelectorAll(
      'input[required]:not([type="radio"]), textarea[required]'
    );
    requiredFields.forEach((field) => {
      if (!field.value.trim()) {
        this.showError(field, "This field is required");
      }
    });

    // Validate required radio groups
    const allRadios = currentSection.querySelectorAll('input[type="radio"]');
    const radioGroups = {};

    allRadios.forEach((radio) => {
      if (!radioGroups[radio.name]) {
        radioGroups[radio.name] = {
          hasRequired: false,
          isChecked: false,
          elements: [],
        };
      }
      radioGroups[radio.name].elements.push(radio);
      if (radio.required) {
        radioGroups[radio.name].hasRequired = true;
      }
      if (radio.checked) {
        radioGroups[radio.name].isChecked = true;
      }
    });

    // Show error for required radio groups that aren't selected
    Object.entries(radioGroups).forEach(([groupName, group]) => {
      if (group.hasRequired && !group.isChecked) {
        // Find the radio group container and show error
        const firstRadio = group.elements[0];
        const radioGroup = firstRadio.closest('.form-group');
        if (radioGroup) {
          // Remove existing error message for this group
          const existingError = radioGroup.querySelector('.error-message');
          if (existingError) {
            existingError.remove();
          }
          
          // Add error message to the radio group
          const errorDiv = document.createElement("div");
          errorDiv.className = "error-message";
          errorDiv.textContent = "Please select an option";
          radioGroup.appendChild(errorDiv);
          
          // Add invalid class to all radios in the group
          group.elements.forEach(radio => {
            radio.classList.add("invalid");
          });
        }
      }
    });
  }

  nextStep() {
    if (!this.validateCurrentStep()) {
      this.showValidationErrors();
      return;
    }

    if (this.currentStep < this.totalSteps - 1) {
      this.completedSteps.add(this.currentStep);

      // Hide current section
      const currentSection = this.shadowRoot.querySelector(
        `.section[data-step="${this.currentStep}"]`
      );
      currentSection.classList.remove("active");

      // Move to next step
      this.currentStep++;

      // Show next section
      const nextSection = this.shadowRoot.querySelector(
        `.section[data-step="${this.currentStep}"]`
      );
      nextSection.classList.add("active");

      // If we're on the review step, populate the review
      if (this.currentStep === 4) {
        this.populateReview();
      }

      this.updateProgress();
      this.updateNavigation();
    }
  }

  prevStep() {
    if (this.currentStep > 0) {
      // Hide current section
      const currentSection = this.shadowRoot.querySelector(
        `.section[data-step="${this.currentStep}"]`
      );
      currentSection.classList.remove("active");

      // Move to previous step
      this.currentStep--;

      // Show previous section
      const prevSection = this.shadowRoot.querySelector(
        `.section[data-step="${this.currentStep}"]`
      );
      prevSection.classList.add("active");

      this.updateProgress();
      this.updateNavigation();
    }
  }

  updateProgress() {
    const progressFill = this.shadowRoot.querySelector(".progress-fill");
    const stepIndicators = this.shadowRoot.querySelectorAll(".step-indicator");

    // Update progress bar
    const progress = (this.currentStep / (this.totalSteps - 1)) * 100;
    progressFill.style.width = `${progress}%`;

    // Update step indicators
    stepIndicators.forEach((indicator, index) => {
      indicator.classList.remove("active", "completed");

      if (index === this.currentStep) {
        indicator.classList.add("active");
      } else if (this.completedSteps.has(index)) {
        indicator.classList.add("completed");
        indicator.querySelector(".step-dot").textContent = "✓";
      } else {
        indicator.querySelector(".step-dot").textContent = index + 1;
      }
    });
  }

  updateNavigation() {
    const prevBtn = this.shadowRoot.getElementById("prevBtn");
    const nextBtn = this.shadowRoot.getElementById("nextBtn");
    const submitBtn = this.shadowRoot.getElementById("submitBtn");

    // Previous button
    prevBtn.style.visibility = this.currentStep > 0 ? "visible" : "hidden";

    // Next/Submit buttons
    if (this.currentStep === this.totalSteps - 1) {
      nextBtn.style.display = "none";
      submitBtn.style.display = "inline-block";
    } else {
      nextBtn.style.display = "inline-block";
      submitBtn.style.display = "none";
    }

    this.validateCurrentStep();
  }

  validateField(field) {
    this.removeError(field);

    if (field.required && !field.value.trim()) {
      this.showError(field, "This field is required");
      return false;
    }

    if (field.type === "email" && field.value.trim()) {
      if (!this.isValidEmail(field.value)) {
        this.showError(field, "Please enter a valid email address");
        return false;
      }
    }

    if (field.type === "tel" && field.value.trim() && field.required) {
      if (!this.isValidPhone(field.value)) {
        this.showError(field, "Please enter a valid phone number");
        return false;
      }
    }

    field.classList.add("valid");
    return true;
  }

  showError(input, message) {
    this.removeError(input);

    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = message;
    input.parentElement.appendChild(errorDiv);

    input.classList.add("invalid");
    input.classList.remove("valid");
  }

  removeError(input) {
    const errorDiv = input.parentElement.querySelector(".error-message");
    if (errorDiv) {
      errorDiv.remove();
    }
    input.classList.remove("invalid");
  }

  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  isValidPhone(phone) {
    return /^\d{3}-\d{3}-\d{4}$/.test(phone);
  }

  showToast(message, isError = false) {
    // Remove any existing toast
    const existingToast = this.shadowRoot.querySelector(".toast");
    if (existingToast) {
      existingToast.remove();
    }

    // Create toast element
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;

    if (isError) {
      toast.classList.add("error");
    }

    // Add to shadow DOM
    this.shadowRoot.appendChild(toast);

    // Trigger animation after a brief delay to ensure element is in DOM
    setTimeout(() => {
      toast.classList.add("show");
    }, 50);

    // Auto-hide after 5 seconds
    setTimeout(() => {
      toast.classList.remove("show");
      toast.classList.add("hide");

      // Remove element after animation completes
      setTimeout(() => {
        if (toast.parentNode) {
          toast.remove();
        }
      }, 300);
    }, 5000);
  }

  populateReview() {
    const reviewContainer = this.shadowRoot.getElementById("reviewContainer");
    const form = this.shadowRoot.getElementById("inquiry-form");

    const sections = [
      {
        title: "Personal Information",
        step: 0,
        fields: [
          { id: "firstName", label: "First Name", required: true },
          { id: "lastName", label: "Last Name", required: true },
          { id: "email", label: "Email", required: true },
          { id: "phone", label: "Phone", required: true },
          { id: "phoneExt", label: "Phone Extension" },
        ],
      },
      {
        title: "Business Information",
        step: 1,
        fields: [
          { id: "businessName", label: "Business Name" },
          { id: "businessPhone", label: "Business Phone" },
          { id: "businessPhoneExt", label: "Business Extension" },
          { id: "businessEmail", label: "Business Email" },
          { id: "businessServices", label: "Business Services" },
        ],
      },
      {
        title: "Mailing Address", // Changed from Billing Address to Mailing Address
        step: 2,
        fields: [
          { id: "billingStreet", label: "Street Address", required: true },
          { id: "billingAptUnit", label: "Apt/Unit" },
          { id: "billingCity", label: "City", required: true },
          { id: "billingState", label: "State/Province", required: true },
          { id: "billingZipCode", label: "ZIP Code", required: true },
          { id: "billingCountry", label: "Country", required: true },
        ],
      },
      {
        title: "Service Details",
        step: 3,
        fields: [
          {
            id: "preferredContact",
            label: "Contact Method",
            type: "radio",
            required: true,
          },
          {
            id: "serviceDesired",
            label: "Service Type",
            type: "radio",
            required: true,
          },
          { id: "hasWebsite", label: "Has Website", type: "radio" },
          { id: "websiteAddress", label: "Website Address" },
          { id: "message", label: "Additional Comments" },
        ],
      },
    ];

    let html = "";

    sections.forEach((section) => {
      html += `<div class="review-section"><h3>${section.title}</h3>`;

      section.fields.forEach((field) => {
        let value = "";

        if (field.type === "radio") {
          const radioInput = form.querySelector(
            `input[name="${field.id}"]:checked`
          );
          value = radioInput ? radioInput.value : "";
        } else {
          const input = form.querySelector(`#${field.id}`);
          value = input ? input.value : "";
        }

        const displayValue = value || "Not provided";
        const isEmpty = !value;

        html += `
          <div class="review-item">
            <div class="review-label">${field.label}${
          field.required ? " *" : ""
        }:</div>
            <div class="review-value ${
              isEmpty ? "empty" : ""
            }">${displayValue}</div>
          </div>
        `;
      });

      html += `<button type="button" class="edit-step-btn" onclick="this.getRootNode().host.editStep(${section.step})">Edit ${section.title}</button></div>`;
    });

    reviewContainer.innerHTML = html;
  }

  editStep(stepNumber) {
    // Hide current section
    const currentSection = this.shadowRoot.querySelector(
      `.section[data-step="${this.currentStep}"]`
    );
    currentSection.classList.remove("active");

    // Move to specified step
    this.currentStep = stepNumber;

    // Show target section
    const targetSection = this.shadowRoot.querySelector(
      `.section[data-step="${this.currentStep}"]`
    );
    targetSection.classList.add("active");

    this.updateProgress();
    this.updateNavigation();
  }

  // Enhanced Firefox-compatible form submission
  async handleFormSubmit(event) {
    event.preventDefault();

    // Disable submit button and change text
    const submitBtn = this.shadowRoot.getElementById("submitBtn");
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";

    // Debug logging
    const isFirefox = navigator.userAgent.toLowerCase().includes("firefox");
    console.log("=== FORM SUBMISSION DEBUG ===");
    console.log(
      "Browser:",
      isFirefox ? "Firefox" : "Other",
      navigator.userAgent
    );

    const form = this.shadowRoot.getElementById("inquiry-form");
    const formData = new FormData(form);
    const formObject = {};

    formData.forEach((value, key) => {
      formObject[key] = value;
    });

    // Add billing address
    formObject.billingAddress = {
      street: this.shadowRoot.getElementById("billingStreet").value || "",
      aptUnit: this.shadowRoot.getElementById("billingAptUnit").value || "",
      city: this.shadowRoot.getElementById("billingCity").value || "",
      state: this.shadowRoot.getElementById("billingState").value || "",
      zipCode: this.shadowRoot.getElementById("billingZipCode").value || "",
      country: this.shadowRoot.getElementById("billingCountry").value || "USA",
    };

    formObject.isFormSubmission = true;

    // Dispatch event
    this.dispatchEvent(
      new CustomEvent("form-submit", {
        bubbles: true,
        composed: true,
        detail: formObject,
      })
    );

    const apiUrl =
      this.getAttribute("api-url") || "http://localhost:5000/api/leads";
    console.log("API URL:", apiUrl);

    try {
      let success = false;

      if (isFirefox) {
        // Force XMLHttpRequest for Firefox
        console.log("🔥 FIREFOX: Using XMLHttpRequest");
        success = await this.submitWithXHR(apiUrl, formObject);
      } else {
        // Use fetch for other browsers
        console.log("🌐 OTHER BROWSER: Using fetch");
        success = await this.submitWithFetch(apiUrl, formObject);
      }

      if (success) {
        console.log("✅ Form submission successful");
        this.showToast("Thank you! We'll be in touch soon.");

        // Reset form
        form.reset();
        this.currentStep = 0;
        this.completedSteps.clear();

        // Reset sections
        this.shadowRoot
          .querySelectorAll(".section")
          .forEach((section, index) => {
            section.classList.remove("active");
            if (index === 0) section.classList.add("active");
          });

        // Remove validation classes from all inputs after successful submission
        const allInputs = this.shadowRoot.querySelectorAll(
          "input, textarea, select"
        );
        allInputs.forEach((input) => {
          input.classList.remove("valid", "invalid");
          this.removeError(input); // Also remove any error messages
        });

        this.updateProgress();
        this.updateNavigation();

        // Re-enable submit button and restore text
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;

        this.dispatchEvent(
          new CustomEvent("form-success", {
            bubbles: true,
            composed: true,
            detail: { message: "Form submitted successfully" },
          })
        );
      }
    } catch (error) {
      console.error("❌ Form submission error:", error);
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });

      let userMessage =
        "There was an error submitting your form. Please try again.";

      if (
        error.message.includes("NetworkError") ||
        error.message.includes("Failed to fetch")
      ) {
        userMessage =
          "Network error. Please check your connection and try again.";
      } else if (error.message.includes("timeout")) {
        userMessage = "Request timed out. Please try again.";
      }

      this.showToast(userMessage, true);

      // Re-enable submit button and restore text
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;

      this.dispatchEvent(
        new CustomEvent("form-error", {
          bubbles: true,
          composed: true,
          detail: { error: error.message },
        })
      );
    }
  }

  // XMLHttpRequest method for Firefox
  async submitWithXHR(url, data) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Set up the request
      xhr.open("POST", url, true);

      // Set headers that Firefox expects
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.setRequestHeader("Accept", "application/json");

      // Handle response
      xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status >= 200 && xhr.status < 300) {
            console.log("XHR Success:", xhr.status, xhr.responseText);
            resolve(true);
          } else {
            console.error(
              "XHR Error:",
              xhr.status,
              xhr.statusText,
              xhr.responseText
            );
            reject(
              new Error(
                `Server responded with ${xhr.status}: ${xhr.statusText}`
              )
            );
          }
        }
      };

      // Handle network errors
      xhr.onerror = function () {
        console.error("XHR Network Error");
        reject(new Error("Network error occurred"));
      };

      // Handle timeout
      xhr.ontimeout = function () {
        console.error("XHR Timeout");
        reject(new Error("Request timed out"));
      };

      // Set timeout (30 seconds)
      xhr.timeout = 30000;

      // Send the request
      try {
        xhr.send(JSON.stringify(data));
      } catch (error) {
        reject(new Error("Failed to send request: " + error.message));
      }
    });
  }

  // Fetch method for other browsers
  async submitWithFetch(url, data) {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
      mode: "cors",
      credentials: "omit",
    });

    if (!response.ok) {
      throw new Error(
        `Server responded with ${response.status}: ${response.statusText}`
      );
    }

    return true;
  }
}

customElements.define("web-inquiry-form", WebInquiryForm);
