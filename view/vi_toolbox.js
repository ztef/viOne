export class vi_toolbox {
    constructor(config, callback) {
        this.container = document.createElement('div');
        this.container.classList.add('toolbox');

        this.options = [];
        this.callback = callback;

        // Create options based on the provided config
        if (config && config.options && Array.isArray(config.options)) {
            config.options.forEach((optionConfig, index) => {
                const optionKey = `option${index + 1}`;
                const optionData = optionConfig[optionKey];

                if (optionData && optionData.icon && optionData.tooltip) {
                    const option = this.createOption(optionData.icon, optionData.tooltip, () => {
                        // Callback function to handle option click
                        if (typeof this.callback === 'function') {
                            this.callback(optionKey);
                        }
                    });
                    this.options.push(option);
                    this.container.appendChild(option);
                }
            });
        }
    }

    createOption(iconUrl, tooltipText, clickHandler) {
        const option = document.createElement('div');
        option.classList.add('toolbox-option');
        // <img src="${iconUrl}" alt="Icon">
        option.innerHTML = `
            <div >
            <img src="${iconUrl}" alt="Icon" width="30" height="30">
            </div>
            <span class="ttooltip">${tooltipText}</span>
        `;
    
        // Add event listeners for mouse hover
        option.addEventListener('mouseover', (event) => {
            const tooltip = event.currentTarget.querySelector('.ttooltip');
    
            const parentRect = event.currentTarget.getBoundingClientRect();

            // Position the tooltip relative to the parent container
            const offsetX = 10; // Adjust as needed
            const offsetY = 10; // Adjust as needed
            tooltip.style.left = `${offsetX}px`;
            tooltip.style.top = `${parentRect.height + offsetY}px`;
            

            // Show the tooltip
            tooltip.style.display = 'block';
        });
    
        // Hide the tooltip when mouse leaves
        option.addEventListener('mouseout', (event) => {
            const tooltip = event.currentTarget.querySelector('.ttooltip');
            tooltip.style.display = 'none';
        });
    
        // Attach click handler
        option.addEventListener('click', clickHandler);
    
        return option;
    }
    

    getToolboxElement() {
        return this.container;
    }
}
