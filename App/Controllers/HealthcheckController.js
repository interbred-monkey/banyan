class HealthCheckController {

  getHealthCheck() {

    const html = `<html>
                    <head>
                      <title>Woooooo Bacon</title>
                    </head>
                    <body>
                      <h1>We are alive</h1>
                    </body>
                  </html>
                  `;

    return [null, html];

  }

}

module.exports = HealthCheckController;