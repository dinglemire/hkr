# Hollow Knight & Silksong Interactive Checklists

### 🔴 [**Click here to use the Interactive Checklist**](https://dinglemire.github.io/hkr/)

This is an interactive, mobile-friendly web application designed to track progress through the 112% completion run of **Hollow Knight**, as well as the checklist for **Hollow Knight: Silksong**. It serves as a digital companion and backup for the original Steam guides.

---

## ⚠️ Credits & Disclaimer

**I do not own the routes, text, or original images used in this project.**

This project is simply a quality-of-life tool to make following specific Steam guides easier on a second monitor or mobile device. All credit goes to the original authors:

### 1. Hollow Knight (112% Route)
Routing logic, step-by-step instructions, and original photography by **blanket**.
*   **Original Guide:** [Hollow Knight 112% Completion Guide](https://steamcommunity.com/sharedfiles/filedetails/?id=936948247)
*   **Author:** [wataniyob](https://steamcommunity.com/id/wataniyob/myworkshopfiles/?section=guides&appid=367520)

### 2. Hollow Knight: Silksong
Checklist and guide structure based on the Steam Community Guide.
*   **Original Guide:** [Silksong 100% Walkthrough](https://steamcommunity.com/sharedfiles/filedetails/?id=3573435111)

---

## 🌟 Features

This web version enhances the original text guides with the following features:

*   **Game Switcher:** Seamlessly toggle between the Hollow Knight route and the Silksong checklist.
*   **Interactive Checklist:** Click items to mark them as done.
*   **Auto-Save:** Your progress is saved to your browser's local storage. If you close the tab, you can pick up exactly where you left off.
*   **Resume Button:** Instantly scrolls you to your first unchecked step.
*   **Interactive Map Integration:** Supports full-screen maps (via interactive external maps or static images) without leaving the page.
*   **Responsive Design:** Works perfectly on 4K Desktops (sidebar layout) and Mobile Phones (top-bar layout).
*   **Theme Support:** Toggle between "Default" (Abyss) and "Steam Guide" themes.

## 📂 Project Structure

*   `index.html` - Main structure for Hollow Knight.
*   `silksong.html` - Main structure for Silksong.
*   `src/hk/` - Assets and scripts specific to Hollow Knight.
*   `src/ss/` - Assets and scripts specific to Silksong.
*   `src/common/` - Shared styles or scripts (if applicable).
*   `route_data.json` - The route data (text and image paths).

## 🚀 How to Run Locally

If you want to run this offline or modify it:

1.  Clone this repository.
2.  Open `index.html` (for HK) or `silksong.html` in your web browser.
    *   *Note: Due to browser security policies regarding JSON files (`fetch`), some features might require running a local server (e.g., Live Server in VS Code) rather than just opening the file directly.*

---

*Fan-made tool. Not affiliated with Team Cherry.*
