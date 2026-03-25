<div align="center">
  <img src="client/frontend/src/assets/images/banner.png" alt="R2C2 Logo" width="600"/>

  <h1>R2 Framework</h1>

  <p>
    <strong>A modern AI assisted post explotation framework for red team operations.</strong>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Go-1.24+-00ADD8?style=flat&logo=go" alt="Go" />
    <img src="https://img.shields.io/badge/Rust-Edition%202024-000000?style=flat&logo=rust" alt="Rust" />
    <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Wails-v2-E30613?style=flat&logo=wails" alt="Wails" />
    <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License" />
  </p>
</div>

---

## 📖 Description

R2 Framework is a modern Command and Control (C2) framework engineered for sophisticated red team engagements and adversary simulation. By combining the concurrency of Go for the Teamserver, the performance and safety of Rust for the Implant, and the flexibility of React + Wails for the Client, R2C2 provides a powerful, seamless experience for operators.


<div align="center">
  <img src="docs/assets/r2.png" alt="R2C2 Client" width="600" style="border-radius: 10px;"/>
</div>

> **⚠️ Disclaimer**: At this moment, the project is not intended to be stealthy, and no evasion techniques have been applied yet.
This will be implemented in future releases.

## ✨ Features

- **🚀 High-Performance Teamserver**: Built with Go to handle concurrent connections and multiple operators efficiently.
- **🦀 Rust-Based Implant**: A memory-safe agent capable of executing complex tasks, crafted in Rust for reliability and performance.
- **🖥️ Modern Wails Client**: A cross-platform desktop application offering a native experience with web technologies (React, TypeScript, TailwindCSS).
- **🤖 Operations Assistant**: Integrated **AI Chatbot** to assist operators with command syntax, strategy suggestions, and automated tasks.
- **📊 Interactive Visualization**:
  - **Network Map**: Real-time visualization of your infrastructure and connected beacons.
- **🛠️ Comprehensive Tooling**:
  - **Screenshot Capture**: Visual surveillance of target desktops.
  - **Command Execution**: Robust shell execution capabilities.
  - **Session Management**: Easy handling of multiple active sessions.

## 📚 Documentation

- **Installation**
  - [Teamserver](docs/01-Installation/Teamserver.md)
  - [Client](docs/01-Installation/Client.md)


# ⚖️ Legal Disclaimer

This project is intended for **educational purposes** and **authorized security testing** only. The developers are not responsible for any misuse of this software. Ensure you have explicit permission from the system owner before running this on any network or device.