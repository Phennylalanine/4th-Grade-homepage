
let power = 0;
let leverActive = false;
let resources = {};
const lever = document.getElementById('lever');
const powerDisplay = document.getElementById('power');
const resourcesList = document.getElementById('resources-list');

window.onload = function() {
    if (localStorage.getItem('power')) {
        power = parseInt(localStorage.getItem('power'));
        powerDisplay.textContent = power;
    }

    if (localStorage.getItem('resources')) {
        resources = JSON.parse(localStorage.getItem('resources'));
        Object.keys(resources).forEach(resourceName => {
            displayResource(resourceName, resources[resourceName].level);
        });
    }

    setInterval(generatePassivePower, 1000); 
};

lever.addEventListener('mousedown', function() {
    leverActive = true;
});

document.addEventListener('mouseup', function() {
    leverActive = false;
});

document.addEventListener('mousemove', function(event) {
    if (leverActive) {
        moveLever(event);
        generatePower();
    }
});

lever.addEventListener('touchstart', function() {
    leverActive = true;
});

document.addEventListener('touchend', function() {
    leverActive = false;
});

document.addEventListener('touchmove', function(event) {
    if (leverActive) {
        moveLever(event.touches[0]);
        generatePower();
    }
});

function moveLever(event) {
    const leverRect = lever.getBoundingClientRect();
    const centerX = leverRect.left + leverRect.width / 2;
    const deltaX = event.clientX - centerX;
    
    if (Math.abs(deltaX) <= 80) {
        lever.style.transform = `translateX(${deltaX}px)`;
    }
}

function generatePower() {
    power += 1;
    powerDisplay.textContent = power;
    localStorage.setItem('power', power);

    if (power >= 50 && !resources['Matter Generation']) {
        unlockResource('Matter Generation');
    }
    if (power >= 100 && !resources['Energy Generator']) {
        unlockResource('Energy Generator');
    }
    if (power >= 200 && !resources['Quantum Reactor']) {
        unlockResource('Quantum Reactor');
    }
    if (power >= 500 && !resources['Dark Matter Synthesizer']) {
        unlockResource('Dark Matter Synthesizer');
    }
    if (power >= 1000 && !resources['Singularity Engine']) {
        unlockResource('Singularity Engine');
    }
}

function unlockResource(resourceName) {
    resources[resourceName] = { level: 1, upgradeCost: 100 };
    localStorage.setItem('resources', JSON.stringify(resources));
    displayResource(resourceName, 1);
}

function displayResource(resourceName, level) {
    const resourceElement = document.createElement('div');
    resourceElement.classList.add('resource-item', `resource-level-${level}`);

    const resourceNameElement = document.createElement('p');
    resourceNameElement.textContent = `${resourceName} (Level ${level})`;
    resourceElement.appendChild(resourceNameElement);

    const upgradeButton = document.createElement('button');
    upgradeButton.textContent = `Upgrade (${resources[resourceName].upgradeCost} power)`;
    upgradeButton.addEventListener('click', function() {
        upgradeResource(resourceName);
    });
    resourceElement.appendChild(upgradeButton);

    const notification = document.createElement('div');
    notification.classList.add('upgrade-notification');
    notification.textContent = `Upgraded to Level ${level + 1}`;
    resourceElement.appendChild(notification);

    resourcesList.appendChild(resourceElement);

    resourceElement.style.opacity = 0;
    setTimeout(() => {
        resourceElement.style.opacity = 1;
        resourceElement.style.transition = 'opacity 1s';
    }, 100);
}

function upgradeResource(resourceName) {
    const resource = resources[resourceName];
    if (power >= resource.upgradeCost) {
        power -= resource.upgradeCost;
        powerDisplay.textContent = power;

        resource.level += 1;
        resource.upgradeCost = Math.floor(resource.upgradeCost * 1.5);
        localStorage.setItem('power', power);
        localStorage.setItem('resources', JSON.stringify(resources));

        updateResourceDisplay(resourceName);

        const resourceElement = resourcesList.querySelector(`div:has(p:contains('${resourceName}'))`);
        resourceElement.classList.add('resource-upgraded');
        setTimeout(() => {
            resourceElement.classList.remove('resource-upgraded');
        }, 1000);

        showUpgradeNotification(resourceElement);
    } else {
        alert("Not enough power to upgrade!");
    }
}

function updateResourceDisplay(resourceName) {
    const resourceElements = resourcesList.getElementsByTagName('div');
    for (let i = 0; i < resourceElements.length; i++) {
        const resourceElement = resourceElements[i];
        if (resourceElement.querySelector('p').textContent.startsWith(resourceName)) {
            const resource = resources[resourceName];
            resourceElement.querySelector('p').textContent = `${resourceName} (Level ${resource.level})`;
            resourceElement.querySelector('button').textContent = `Upgrade (${resource.upgradeCost} power)`;
            resourceElement.className = `resource-item resource-level-${resource.level}`;
        }
    }
}

function showUpgradeNotification(resourceElement) {
    const notification = resourceElement.querySelector('.upgrade-notification');
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 1500);
}

function generatePassivePower() {
    Object.keys(resources).forEach(resourceName => {
        power += resources[resourceName].level;
    });
    powerDisplay.textContent = power;
    localStorage.setItem('power', power);
}

document.addEventListener('mouseup', function() {
    lever.style.transform = 'translateX(-50%)';
});

document.addEventListener('touchend', function() {
    lever.style.transform = 'translateX(-50%)';
});
