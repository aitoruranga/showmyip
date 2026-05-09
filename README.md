# IP Insights

A modern, client-side web application that displays your public IP address and connection details using a sleek, glassmorphism design. Built purely with Vanilla JavaScript, HTML, and CSS—no backend required.

## Features

- **Public IP Detection**: Instantly fetches and displays your current public IP address.
- **Connection Details**: Shows your ISP, city, region, country, postal code, and timezone.
- **Interactive Map**: Integrates with [Leaflet.js](https://leafletjs.com/) to provide a visual representation of your approximate location.
- **Local History**: Saves your previous IP addresses locally using browser cookies and displays them in a history timeline.
- **Modern UI**: Features a dark mode theme, glassmorphic panels, vibrant background blobs, and smooth skeleton loading animations.

## Technologies Used

- **HTML5** & **CSS3** (Custom properties, Flexbox/Grid, Animations)
- **Vanilla JavaScript** (ES6+, Fetch API)
- **Leaflet.js** (for map rendering)
- **ipapi.co** (Free, no-auth IP geolocation API)
- **Google Fonts** (Inter)

## Getting Started

Since this project relies completely on client-side code and public APIs, setup is incredibly simple.

### Prerequisites

You just need a modern web browser and an internet connection.

### Installation

1. Clone or download the repository to your local machine.
2. Place the files in any web server directory (e.g., `htdocs` for XAMPP, `www` for WAMP, or simply use VS Code Live Server). 
3. Open `index.html` in your web browser.

> **Note**: Due to CORS policies with location and network APIs, it's highly recommended to serve the files through a local web server (like `localhost`) rather than opening the file directly from your file system (`file://`).

## Usage

When you open the application, it will automatically fetch your IP data. Ensure your ad-blocker or tracking protection is not blocking requests to `ipapi.co`, as this will prevent the data from loading.

## License

This project is open-source and available under the [MIT License](LICENSE).
