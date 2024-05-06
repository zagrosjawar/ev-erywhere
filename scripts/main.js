document.addEventListener('DOMContentLoaded', function () {
    console.log("DOM fully loaded and parsed");
    const devices = document.querySelectorAll('.device-list li:not(.add-device)');
    console.log(devices);
    devices.forEach(device => {
        device.addEventListener('click', function () {
            // find the "status" span within the clicked list item
            const status = this.querySelector('.status');

            // check if the status is "Ikke tilkoblet"
            if (status.textContent === 'Ikke tilkoblet') {
                // set the status to "Tilkobler..."
                status.textContent = 'Tilkobler...';
                // simulate a delay of 2 seconds
                setTimeout(() => {
                    // set the status to "Tilkoblet"
                    status.textContent = 'Tilkoblet';
                    this.style.backgroundColor = "#7BCBC6"
                }, 2000);
            } else {
                // set the status to "Ikke tilkoblet"
                status.textContent = 'Ikke tilkoblet';
                this.style.backgroundColor = "#E0F7FF"
            }
        });
    })
});