$(document).ready(function () {
    let colorSchemes = [];
    
    /* ------------------- Overall setup ------------------- */
    // get & process color scheme data
    function fetchColorSchemes() {
        // Show loading indicator
        $('#colorSwatches').html('<div class="loading-spinner"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div><p class="mt-2 text-muted">Loading color schemes...</p></div>');
        
        $.ajax({
            url: 'assets/schemes.txt',
            type: 'GET',
            dataType: 'text',
            cache: false, // Disable cache
            timeout: 10000, // Set timeout
            success: function(data) {
                colorSchemes = processColorSchemeData(data);
                populateColorCountDropdown();
                populateSchemeDropdown(colorSchemes);
                initializeSelect2();
                
                // Show success message after loading
                const $notification = $('<div class="toast-notification success">').text('Color schemes loaded successfully!');
                $('body').append($notification);
                setTimeout(() => {
                    $notification.addClass('show');
                    setTimeout(() => {
                        $notification.removeClass('show');
                        setTimeout(() => $notification.remove(), 300);
                    }, 2000);
                }, 100);
            },
            error: function(xhr, status, error) {
                console.error("Failed to fetch color schemes:", error);
                // Try local mock data
                console.log("Using local mock data as fallback");
                const mockData = getMockColorSchemes();
                colorSchemes = mockData;
                populateColorCountDropdown();
                populateSchemeDropdown(colorSchemes);
                initializeSelect2();
            }
        });
    }

    function processColorSchemeData(data) {
        const lines = data.trim().split('\n');
        return lines.map(line => line.split(',').map(color => color.trim().toUpperCase()))
            .sort((a, b) => a.length - b.length)
            .map((schemeColors, index) => ({ id: index, colors: schemeColors }));
    }

    // Setup event listeners
    function bindEventListeners() {
        $('#predefinedSchemeOption').on('change', handlePredefinedSchemeSwitch);
        $('#customSchemeOption').on('change', handleCustomSchemeSwitch);
        $('#colorCountSelect').on('change', handleColorCountChange);
        $('#schemeSelect').on('change', handleSchemeChange);
        $('#customColors').on('input', handleCustomColorInput);
        $('#opacitySlider').on('input', handleOpacityChange);
        
        // Add keyboard navigation support for color swatches
        $(document).on('keydown', function(e) {
            if (e.key === 'c' && (e.ctrlKey || e.metaKey)) {
                const $swatches = $('.swatch');
                if ($swatches.length) {
                    const colors = [];
                    $swatches.each(function() {
                        colors.push($(this).data('color'));
                    });
                    copyToClipboard(colors.join(', '));
                    showCopyNotification('All colors copied to clipboard!');
                }
            }
        });
    }

    /* ------------------- Event handlers ------------------- */
    // Mode switch handlers (Predefined vs Custom)
    function handlePredefinedSchemeSwitch() {
        $('#predefinedContent').show();
        $('#customInputContent').hide();
        
        // Reinitialize select2 to ensure correct rendering
        try {
            if ($('#schemeSelect').hasClass("select2-hidden-accessible")) {
                $('#schemeSelect').select2('destroy');
            }
        } catch (e) {
            console.log("Select2 was not initialized yet", e);
        }
        
        $('#schemeSelect').select2({
            templateResult: formatOption,
            templateSelection: formatOptionSelection,
            minimumResultsForSearch: Infinity,
            theme: 'default',
            dropdownParent: $('body')
        });
        
        const selectedSchemeID = parseInt($('#schemeSelect').val());
        if (!isNaN(selectedSchemeID)) {
            applySchemeByIndex(selectedSchemeID);
        }
    }
    function handleCustomSchemeSwitch() {
        $('#predefinedContent').hide();
        $('#customInputContent').show();
        $('#hexDisplay').html(''); // Remove all hint text
        $('#colorSwatches').empty();
    }

    // Custom color input handler
    function handleCustomColorInput() {
        // read input, validate, and update display
        const customColors = $(this).val().split(',')
            .map(color => {
                // Add # prefix if missing
                color = color.trim().toUpperCase();
                return color.startsWith('#') ? color : `#${color}`;
            })
            .filter(isValidHex);
            
        if (customColors.length > 0) {
            // Clear any existing error messages
            $('.custom-input-error').remove();
            updateSchemeDisplay(customColors);
        } else {
            // Show error message under the input field instead
            $('.custom-input-error').remove();
            const errorMsg = $('<div class="custom-input-error text-danger mt-2">Invalid HEX code(s) detected. Please enter valid HEX values.</div>');
            $('#customColors').after(errorMsg);
            // Clear the swatches
            $('#hexDisplay').html('');
            $('#colorSwatches').empty();
        }
    }

    function isValidHex(color) {
        const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        return hexRegex.test(color);
    }

    // Initialize Select2 dropdowns (color count and scheme)
    function initializeSelect2() {
        $('#colorCountSelect').select2({ 
            minimumResultsForSearch: Infinity,
            theme: 'default'
        });
        
        $('#schemeSelect').select2({ 
            templateResult: formatOption,
            templateSelection: formatOptionSelection,
            minimumResultsForSearch: Infinity,
            theme: 'default',
            dropdownParent: $('body')
        });
    }

    // Custom rendering for options in the dropdown
    function formatOption(scheme) {
        if (!scheme.id) return scheme.text;
        const selectedScheme = colorSchemes.find(s => s.id == scheme.id);
        if (!selectedScheme) return scheme.text;
        
        const swatches = selectedScheme.colors.map(color => 
            `<span class="color-swatch" style="background-color: ${color};"></span>`
        ).join('');
        
        return $(`<span class="select-option-row">
            <span>S${parseInt(scheme.id) + 1}</span>
            <span class="select-swatches">${swatches}</span>
        </span>`);
    }

    // Custom rendering for the selected option
    function formatOptionSelection(scheme) {
        if (!scheme.id) return scheme.text;
        const selectedScheme = colorSchemes.find(s => s.id == scheme.id);
        if (!selectedScheme) return scheme.text;
        
        const swatches = selectedScheme.colors.map(color => 
            `<span class="color-swatch" style="background-color: ${color};"></span>`
        ).join('');
        
        return $(`<span class="select-option-row">
            <span>S${parseInt(scheme.id) + 1}</span>
            <span class="select-swatches">${swatches}</span>
        </span>`);
    }

    // Populate color count dropdown
    function populateColorCountDropdown() {
        const colorCounts = [...new Set(colorSchemes.map(scheme => scheme.colors.length))].sort((a, b) => a - b);
        const $colorCountSelect = $('#colorCountSelect').empty();
        $colorCountSelect.append(`<option value="-1">All Schemes</option>`);
        colorCounts.forEach(count => {
            $colorCountSelect.append(`<option value="${count}">${count}-color schemes</option>`);
        });
    }

    // Handle color count change
    function handleColorCountChange() {
        const selectedCount = parseInt($(this).val());
        const filteredSchemes = selectedCount === -1 ? colorSchemes : colorSchemes.filter(scheme => scheme.colors.length === selectedCount);
        populateSchemeDropdown(filteredSchemes);
    }

    // Populate scheme dropdown with color swatches
    function populateSchemeDropdown(schemes) {
        const $schemeSelect = $('#schemeSelect').empty();
        
        schemes.forEach(scheme => {
            // Create option with scheme ID as value
            $schemeSelect.append(new Option(`Scheme ${scheme.id + 1}`, scheme.id));
        });
        
        if (schemes.length > 0) {
            $schemeSelect.val(schemes[0].id).trigger('change');
        }
        
        // Note: Destroy existing select2 before reinitializing
        try {
            if ($('#schemeSelect').hasClass("select2-hidden-accessible")) {
                $('#schemeSelect').select2('destroy');
            }
        } catch (e) {
            console.log("Select2 was not initialized yet", e);
        }
        
        $('#schemeSelect').select2({
            templateResult: formatOption,
            templateSelection: formatOptionSelection,
            minimumResultsForSearch: Infinity,
            theme: 'default',
            dropdownParent: $('body')
        });
    }

    function applySchemeByIndex(schemeID) {
        const selectedScheme = colorSchemes.find(scheme => scheme.id === schemeID);
        updateSchemeDisplay(selectedScheme.colors);
    }

    function handleSchemeChange() {
        const selectedSchemeID = parseInt($(this).val());
        applySchemeByIndex(selectedSchemeID);
    }

    // Update all scheme display
    function renderHexDisplay(colors) {
        // Remove the "Current scheme:" text completely
        $('#hexDisplay').html('');
    }

    function renderSwatches(colors) {
        const $swatchesContainer = $('#colorSwatches').empty();
        
        colors.forEach((color, index) => {
            const $swatch = $(`<div class="swatch" style="background-color: ${color};" data-color="${color}"></div>`);
            
            // Add delayed appearance animation
            setTimeout(() => {
                $swatch.addClass('visible');
            }, index * 50);
            
            $swatch.on('click', () => {
                copyToClipboard(color);
                showCopyNotification(`Copied ${color} to clipboard!`);
                
                // Add feedback animation
                $swatch.addClass('copied');
                setTimeout(() => {
                    $swatch.removeClass('copied');
                }, 500);
            });
            
            // Add tooltip showing hex value on hover
            $swatch.append(`<span class="swatch-tooltip">${color}</span>`);
            
            $swatchesContainer.append($swatch);
        });
        
        // Remove any existing Copy all button before adding a new one
        $('.copy-all-btn').remove();
        
        // Add a "Copy all" button
        const $copyAllBtn = $(`<button class="btn btn-primary copy-all-btn">Copy all colors</button>`);
        $copyAllBtn.on('click', () => {
            copyToClipboard(colors.join(', '));
            showCopyNotification('All colors copied to clipboard!');
        });
        $swatchesContainer.after($copyAllBtn);
    }

    function updateSchemeDisplay(colors) {
        renderHexDisplay(colors);
        renderSwatches(colors);
        
        // Get current opacity value
        const opacity = parseFloat($('#opacitySlider').val()) || 1.0;
        
        // Check if plots.js is loaded
        if (typeof renderCharts === 'function') {
            renderCharts(colors, opacity);
        } else {
            console.error("renderCharts function is not available. Check if plots.js is loaded correctly.");
            // Prevent page crash, give a visual prompt
            $('.chart-container').html('<div class="alert alert-warning text-center p-3">Unable to load charts. Please refresh the page.</div>');
        }
    }

    // Copy color HEX to clipboard
    function copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                console.log(`Copied to clipboard: ${text}`);
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
        } else {
            const tempInput = document.createElement('input');
            document.body.appendChild(tempInput);
            tempInput.value = text;
            tempInput.select();
            document.execCommand('copy');
            document.body.removeChild(tempInput);
        }
    }

    function showCopyNotification(message) {
        // Remove any existing notifications
        $('.copy-notification').remove();
        
        const $notification = $('<div class="copy-notification">').text(message);
        $('body').append($notification);
        
        // Remove after animation completes
        setTimeout(() => {
            $notification.addClass('fade-out');
            setTimeout(() => $notification.remove(), 300);
        }, 2000);
    }

    // Create mock data in case remote data loading fails
    function getMockColorSchemes() {
        const defaultColors = [
            ["#B22222", "#000080"],
            ["#B22222", "#228B22", "#000080"],
            ["#B22222", "#228B22", "#4682B4", "#000080"],
            ["#B22222", "#DAA520", "#228B22", "#4682B4", "#000080"],
            ["#B22222", "#FF8C00", "#DAA520", "#228B22", "#4682B4", "#000080"]
        ];
        
        return defaultColors.map((colors, index) => ({
            id: index,
            colors: colors
        }));
    }

    // Handle opacity slider change
    function handleOpacityChange() {
        const opacity = parseFloat($(this).val());
        $('#opacityValue').text(opacity.toFixed(2));
        
        // Get current color scheme
        let currentColors;
        if ($('#predefinedSchemeOption').is(':checked')) {
            const selectedSchemeID = parseInt($('#schemeSelect').val());
            const selectedScheme = colorSchemes.find(scheme => scheme.id === selectedSchemeID);
            if (selectedScheme) {
                currentColors = selectedScheme.colors;
            }
        } else {
            currentColors = $('#customColors').val().split(',')
                .map(color => {
                    color = color.trim().toUpperCase();
                    return color.startsWith('#') ? color : `#${color}`;
                })
                .filter(isValidHex);
        }
        
        // If we have valid colors, render the charts
        if (currentColors && currentColors.length > 0 && typeof renderCharts === 'function') {
            renderCharts(currentColors, opacity);
        }
    }

    // Initialize the app
    fetchColorSchemes();
    bindEventListeners();
    $('#customInputContent').hide(); // Initial hide
});
