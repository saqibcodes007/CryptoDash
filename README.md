# CryptDash - Delta Exchange Dashboard

A modern, real-time desktop dashboard for viewing open positions and PNL on Delta Exchange, built with Electron and Python.

![image](https://github.com/user-attachments/assets/95df4844-dc96-44d1-96ea-71333cb2b943)

---

## ✨ Features

* **Real-Time Data:** Automatically fetches and displays open positions every 5 seconds.
* **Advanced PNL Calculations:** Calculates and displays Unrealised PNL in both absolute value and as a percentage of margin used.
* **Live PNL Chart:** A continuous line chart visualizes your portfolio's PNL % over time.
* **Modern UI:** A sleek, futuristic interface designed for clarity.
* **Persistent Settings:** Securely saves your API credentials and theme preference so you don't have to log in every time.
* **Light & Dark Themes:** Easily toggle between a dark (default) and light theme directly from the dashboard.

## 🛠️ Tech Stack

* **Frontend:** Electron, HTML5, CSS3, JavaScript
* **Charting:** Chart.js
* **Backend:** Python
* **API Communication:** Node.js `child_process`
* **Settings Persistence:** `electron-store`

## 🚀 Getting Started

Follow these instructions to get a local copy up and running.

### Prerequisites

* [Node.js](https://nodejs.org/) (LTS version)
* [Python](https://www.python.org/downloads/)
* [Git](https://git-scm.com/downloads)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/YourUsername/CryptDash.git](https://github.com/YourUsername/CryptDash.git)
    cd CryptDash
    ```

2.  **Set up the Python Backend:**
    * Create the virtual environment:
        ```bash
        python -m venv venv
        ```
    * Activate the environment:
        * On Windows (PowerShell): `.\venv\Scripts\Activate.ps1`
        * On macOS/Linux: `source venv/bin/activate`
    * Install the required Python packages:
        ```bash
        pip install -r backend/requirements.txt
        ```

3.  **Set up the Frontend:**
    * Install the Node.js packages:
        ```bash
        npm install
        ```

4.  **Run the Application:**
    ```bash
    npm start
    ```

### Configuration

On the first launch, the application will prompt you for your Delta Exchange API Key and Secret. For security, it is highly recommended to use a **read-only** API key. You can check the "Save Credentials" box to have them securely stored for future sessions.

---

<p align="center">
  Developed by Saqib Sherwani
  <br>
  Copyright © 2025 • All Rights Reserved
</p>

> **Disclaimer:** This application is a personal project and is not affiliated with Delta Exchange. Use at your own risk. The author is not responsible for any financial losses. Always handle your API keys with extreme care.
