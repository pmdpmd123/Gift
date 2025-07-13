// Ultra Enhanced 3D Gift Box with Advanced Effects and Audio
// Global variables
let scene, camera, renderer, giftBox, boxLid, ribbon, textMesh, clickMeText;
let isOpened = false;
let animationId;
let sparkles = [];
let particles = [];
let floatingParticles = [];
let clock = new THREE.Clock();
let mouse = new THREE.Vector2();
let raycaster = new THREE.Raycaster();

// Audio variables
let audioContext;
let backgroundMusic, clickSound, openSound, magicSound;
let audioInitialized = false;

// Text-to-Speech variables
let speechSynthesis;
let speechSupported = false;

// Animation variables
let hoverEffect = false;
let giftBoxOriginalY = 0;

// Initialize audio system
function initAudio() {
    if (audioInitialized) return;
    
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        backgroundMusic = document.getElementById('backgroundMusic');
        clickSound = document.getElementById('clickSound');
        openSound = document.getElementById('openSound');
        magicSound = document.getElementById('magicSound');
        
        // Initialize Text-to-Speech
        initTextToSpeech();
        
        // Create simple tones since we can't load external audio easily
        createAudioTones();
        
        audioInitialized = true;
        console.log("🔊 Audio system initialized!");
    } catch (e) {
        console.log("Audio not supported, continuing without sound");
    }
}

// Initialize Text-to-Speech
function initTextToSpeech() {
    if ('speechSynthesis' in window) {
        speechSynthesis = window.speechSynthesis;
        speechSupported = true;
        console.log("🗣️ Text-to-Speech supported!");
        
        // Check if mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (isMobile) {
            console.log("📱 Mobile device detected, using mobile-optimized speech");
        }
        
        // Wait for voices to load and force load on mobile
        const loadVoices = () => {
            const voices = speechSynthesis.getVoices();
            console.log("🗣️ Available voices:", voices.length);
            if (voices.length > 0) {
                console.log("✅ Voices loaded successfully!");
                // Test voice on mobile to ensure it works
                if (isMobile) {
                    testMobileSpeech();
                }
            }
        };
        
        // Load voices immediately if available
        loadVoices();
        
        // Also listen for voices changed event
        speechSynthesis.addEventListener('voiceschanged', loadVoices);
        
        // Force voice loading on mobile
        if (isMobile) {
            setTimeout(loadVoices, 1000);
        }
    } else {
        console.log("❌ Text-to-Speech not supported in this browser");
        speechSupported = false;
    }
}

// Test speech on mobile devices
function testMobileSpeech() {
    try {
        const testUtterance = new SpeechSynthesisUtterance("");
        testUtterance.volume = 0; // Silent test
        speechSynthesis.speak(testUtterance);
        console.log("📱 Mobile speech test completed");
    } catch (e) {
        console.log("📱 Mobile speech test failed:", e);
    }
}

// Function to speak Vietnamese text
function speakVietnameseText(text) {
    if (!speechSupported || !speechSynthesis) {
        console.log("Text-to-Speech not available");
        showTextFallback(text);
        return;
    }
    
    // Cancel any ongoing speech
    speechSynthesis.cancel();
    
    // Small delay to ensure cancel is processed
    setTimeout(() => {
        // Create speech utterance
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Configure voice settings for mobile compatibility
        utterance.rate = 0.7; // Slower rate for mobile
        utterance.pitch = 1.0; // Normal pitch for mobile
        utterance.volume = 1.0; // Full volume
        utterance.lang = 'vi-VN'; // Set Vietnamese language explicitly
        
        // Get voices and find the best one
        const voices = speechSynthesis.getVoices();
        console.log("🗣️ Looking through", voices.length, "voices");
        
        // Try to find Vietnamese voice first
        let selectedVoice = voices.find(voice => 
            voice.lang.includes('vi') || 
            voice.lang.includes('VN') ||
            voice.name.toLowerCase().includes('vietnam') ||
            voice.name.toLowerCase().includes('vietnamese')
        );
        
        // Fallback to female voice if no Vietnamese
        if (!selectedVoice) {
            selectedVoice = voices.find(voice => 
                voice.name.toLowerCase().includes('female') ||
                voice.name.toLowerCase().includes('woman') ||
                voice.name.toLowerCase().includes('girl') ||
                voice.name.toLowerCase().includes('samantha') ||
                voice.name.toLowerCase().includes('karen') ||
                voice.name.toLowerCase().includes('amelie')
            );
        }
        
        // Final fallback to any available voice
        if (!selectedVoice && voices.length > 0) {
            selectedVoice = voices[0];
        }
        
        if (selectedVoice) {
            utterance.voice = selectedVoice;
            console.log("�️ Selected voice:", selectedVoice.name, selectedVoice.lang);
        } else {
            console.log("🗣️ Using default system voice");
        }
        
        // Add event listeners with mobile-specific handling
        utterance.onstart = () => {
            console.log("🗣️ Started speaking:", text);
            highlightSpeechButton(true);
        };
        
        utterance.onend = () => {
            console.log("✅ Finished speaking");
            highlightSpeechButton(false);
        };
        
        utterance.onerror = (event) => {
            console.log("❌ Speech error:", event.error);
            showTextFallback(text);
            highlightSpeechButton(false);
        };
        
        // Speak with mobile-specific retry logic
        try {
            speechSynthesis.speak(utterance);
            
            // Mobile fallback: if speech doesn't start in 2 seconds, retry
            setTimeout(() => {
                if (speechSynthesis.speaking === false && speechSynthesis.pending === false) {
                    console.log("📱 Speech didn't start, retrying...");
                    speechSynthesis.speak(utterance);
                }
            }, 2000);
            
        } catch (e) {
            console.log("❌ Speech failed:", e);
            showTextFallback(text);
        }
        
    }, 100);
}

// Fallback function to show text visually when speech fails
function showTextFallback(text) {
    console.log("📝 Using visual fallback for:", text);
    
    // Create a visual popup with the text
    const popup = document.createElement('div');
    popup.className = 'speech-fallback';
    popup.innerHTML = `
        <div class="fallback-content">
            <h3>🗣️ Đọc to:</h3>
            <p>"${text}"</p>
            <small>Trình duyệt không hỗ trợ đọc text</small>
        </div>
    `;
    
    document.body.appendChild(popup);
    
    // Remove popup after 3 seconds
    setTimeout(() => {
        popup.remove();
    }, 3000);
}

// Function to highlight speech button when speaking
function highlightSpeechButton(isActive) {
    const button = document.getElementById('speakButton');
    if (button) {
        if (isActive) {
            button.style.background = 'linear-gradient(45deg, #ff6b6b, #ffd700)';
            button.textContent = '🔊 Đang đọc...';
        } else {
            button.style.background = 'linear-gradient(45deg, #ffd700, #ffed4e)';
            button.textContent = '🔊 Nghe lại';
        }
    }
}

function createAudioTones() {
    // Create magical background ambience
    if (audioContext) {
        const bgOscillator = audioContext.createOscillator();
        const bgGain = audioContext.createGain();
        
        bgOscillator.type = 'sine';
        bgOscillator.frequency.setValueAtTime(220, audioContext.currentTime);
        bgGain.gain.setValueAtTime(0.1, audioContext.currentTime);
        
        bgOscillator.connect(bgGain);
        bgGain.connect(audioContext.destination);
    }
}

function playSound(type) {
    if (!audioInitialized || !audioContext) return;
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        switch(type) {
            case 'click':
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.1);
                break;
                
            case 'open':
                oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.5);
                gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.5);
                break;
                
            case 'magic':
                oscillator.frequency.setValueAtTime(660, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(1320, audioContext.currentTime + 1);
                gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 1);
                break;
        }
    } catch (e) {
        console.log("Could not play sound:", e);
    }
}

// Initialize the enhanced 3D scene
function init() {
    console.log("🎁 Initializing ultra magical gift box...");
    
    // Initialize audio first
    initAudio();
    
    // Create scene with enhanced atmosphere
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x1a1a2e, 12, 50);
    
    // Create camera with cinematic positioning
    camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 12);
    camera.lookAt(0, 1, 0);
    
    // Create renderer with max quality settings
    renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x0f0f23, 1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    renderer.physicallyCorrectLights = true;
    
    document.getElementById('container').appendChild(renderer.domElement);
    
    // Setup ultra enhanced lighting
    setupUltraLighting();
    
    // Create the ultra magical gift box
    createUltraMagicalGiftBox();
    
    // Create premium reflective ground
    createPremiumGround();
    
    // Create enhanced ambient magic
    createEnhancedAmbientMagic();
    
    // Create floating UI particles
    createFloatingUIParticles();
    
    // Create Vietnamese text mesh
    createVietnameseTextMesh();
    
    // Create 3D "Click Me" text above gift box
    createClickMeText3D();
    
    // Setup advanced post-processing
    setupAdvancedEffects();
    
    // Hide loading text
    document.getElementById('loading').style.display = 'none';
    
    // Add enhanced event listeners
    setupEventListeners();
    
    // Start the ultra magical animation loop
    animate();
    
    console.log("✨ Ultra magical gift box initialized with premium effects!");
}

function setupUltraLighting() {
    // Enhanced ambient light
    const ambientLight = new THREE.AmbientLight(0x404080, 0.5);
    scene.add(ambientLight);
    
    // Main cinematic light
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(10, 15, 8);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 4096;
    mainLight.shadow.mapSize.height = 4096;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 100;
    mainLight.shadow.camera.left = -15;
    mainLight.shadow.camera.right = 15;
    mainLight.shadow.camera.top = 15;
    mainLight.shadow.camera.bottom = -15;
    mainLight.shadow.bias = -0.0001;
    scene.add(mainLight);
    
    // Dramatic rim lights
    const rimLight1 = new THREE.DirectionalLight(0x4169e1, 0.8);
    rimLight1.position.set(-10, 10, -8);
    scene.add(rimLight1);
    
    const rimLight2 = new THREE.DirectionalLight(0xff6b6b, 0.4);
    rimLight2.position.set(8, 8, -10);
    scene.add(rimLight2);
    
    // Multiple magical point lights
    const magicLights = [
        { color: 0xffd700, intensity: 1.2, position: [0, 8, 0] },
        { color: 0xff6b6b, intensity: 0.6, position: [4, 5, 4] },
        { color: 0x4ecdc4, intensity: 0.6, position: [-4, 5, -4] },
        { color: 0x45b7d1, intensity: 0.4, position: [6, 3, -2] },
        { color: 0x96ceb4, intensity: 0.4, position: [-6, 3, 2] }
    ];
    
    magicLights.forEach(lightData => {
        const light = new THREE.PointLight(lightData.color, lightData.intensity, 20);
        light.position.set(...lightData.position);
        light.castShadow = true;
        light.shadow.mapSize.width = 1024;
        light.shadow.mapSize.height = 1024;
        scene.add(light);
    });
}

function createUltraMagicalGiftBox() {
    const boxGroup = new THREE.Group();
    
    // Ultra enhanced box base
    const boxGeometry = new THREE.BoxGeometry(4, 2.5, 4);
    const boxMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xdc143c,
        metalness: 0.1,
        roughness: 0.2,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        transparent: true,
        opacity: 0.98
    });
    
    const boxBase = new THREE.Mesh(boxGeometry, boxMaterial);
    boxBase.position.y = 1.25;
    boxBase.castShadow = true;
    boxBase.receiveShadow = true;
    boxGroup.add(boxBase);
    
    // Ultra enhanced box lid
    const lidGeometry = new THREE.BoxGeometry(4.1, 0.5, 4.1);
    const lidMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xb22222,
        metalness: 0.2,
        roughness: 0.15,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05
    });
    
    boxLid = new THREE.Mesh(lidGeometry, lidMaterial);
    boxLid.position.y = 2.75;
    boxLid.castShadow = true;
    boxLid.receiveShadow = true;
    boxGroup.add(boxLid);
    
    // Premium golden ribbon system
    createPremiumRibbon(boxGroup);
    
    // Add ultra magical glow
    createUltraMagicalGlow(boxGroup);
    
    // Add floating decorative elements
    createFloatingDecorations(boxGroup);
    
    giftBox = boxGroup;
    giftBoxOriginalY = 0;
    scene.add(giftBox);
}

function createPremiumRibbon(boxGroup) {
    const ribbonMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffd700,
        metalness: 0.8,
        roughness: 0.1,
        clearcoat: 1.0,
        clearcoatRoughness: 0.02,
        emissive: 0x332200,
        emissiveIntensity: 0.2
    });
    
    // Enhanced horizontal ribbon
    const ribbonHGeometry = new THREE.BoxGeometry(4.2, 0.6, 0.5);
    const ribbonH = new THREE.Mesh(ribbonHGeometry, ribbonMaterial);
    ribbonH.position.y = 1.8;
    ribbonH.castShadow = true;
    boxGroup.add(ribbonH);
    
    // Enhanced vertical ribbon
    const ribbonVGeometry = new THREE.BoxGeometry(0.5, 3.2, 4.2);
    const ribbonV = new THREE.Mesh(ribbonVGeometry, ribbonMaterial);
    ribbonV.position.y = 1.25;
    ribbonV.castShadow = true;
    boxGroup.add(ribbonV);
    
    // Premium bow with multiple segments
    const bowParts = [
        { geometry: new THREE.SphereGeometry(0.8, 24, 16), scale: [1.4, 0.7, 1.2], position: [0, 3.1, 0] },
        { geometry: new THREE.CylinderGeometry(0.2, 0.2, 0.5, 16), scale: [1, 1, 1], position: [0, 3.1, 0], rotation: [Math.PI/2, 0, 0] }
    ];
    
    bowParts.forEach(part => {
        const bow = new THREE.Mesh(part.geometry, ribbonMaterial);
        bow.position.set(...part.position);
        bow.scale.set(...part.scale);
        if (part.rotation) bow.rotation.set(...part.rotation);
        bow.castShadow = true;
        boxGroup.add(bow);
    });
    
    // Premium bow tails with curves
    const tailGeometry = new THREE.ConeGeometry(0.3, 1.5, 12);
    [-1, 1].forEach((side, index) => {
        const tail = new THREE.Mesh(tailGeometry, ribbonMaterial);
        tail.position.set(side * 1.2, 2.7, 0);
        tail.rotation.z = side * Math.PI / 8;
        tail.castShadow = true;
        boxGroup.add(tail);
    });
}

function createUltraMagicalGlow(boxGroup) {
    // Multiple glow layers for ultra effect
    const glowLayers = [
        { size: [5, 4, 5], opacity: 0.15, color: 0xffd700 },
        { size: [6, 5, 6], opacity: 0.08, color: 0xff6b6b },
        { size: [7, 6, 7], opacity: 0.05, color: 0x4ecdc4 }
    ];
    
    glowLayers.forEach(layer => {
        const glowGeometry = new THREE.BoxGeometry(...layer.size);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: layer.color,
            transparent: true,
            opacity: layer.opacity,
            side: THREE.BackSide
        });
        
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.y = 1.25;
        boxGroup.add(glow);
    });
}

function createFloatingDecorations(boxGroup) {
    // Add small floating gems around the box
    for (let i = 0; i < 8; i++) {
        const gemGeometry = new THREE.OctahedronGeometry(0.1);
        const gemMaterial = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color().setHSL(i / 8, 0.7, 0.6),
            transparent: true,
            opacity: 0.8,
            metalness: 0.1,
            roughness: 0.1
        });
        
        const gem = new THREE.Mesh(gemGeometry, gemMaterial);
        const angle = (i / 8) * Math.PI * 2;
        gem.position.set(
            Math.cos(angle) * 3,
            2 + Math.sin(i) * 0.5,
            Math.sin(angle) * 3
        );
        
        gem.userData = {
            originalPosition: gem.position.clone(),
            floatOffset: i * 0.5,
            rotationSpeed: 0.02 + Math.random() * 0.02
        };
        
        boxGroup.add(gem);
        floatingParticles.push(gem);
    }
}

function createPremiumGround() {
    const groundGeometry = new THREE.PlaneGeometry(30, 30);
    const groundMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x2c2c54,
        metalness: 0.1,
        roughness: 0.3,
        transparent: true,
        opacity: 0.9,
        clearcoat: 0.5,
        clearcoatRoughness: 0.2
    });
    
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // Enhanced grid with glowing effect
    const gridHelper = new THREE.GridHelper(30, 60, 0x4444aa, 0x333366);
    gridHelper.position.y = -0.05;
    gridHelper.material.opacity = 0.4;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);
}

function createEnhancedAmbientMagic() {
    // Create various types of magical particles
    for (let i = 0; i < 120; i++) {
        createAdvancedMagicalParticle();
    }
    
    // Create continuous HTML sparkle effects
    createContinuousHTMLSparkles();
}

function createAdvancedMagicalParticle() {
    const particleTypes = [
        { geometry: new THREE.SphereGeometry(0.04, 8, 8), color: 0xffd700 },
        { geometry: new THREE.TetrahedronGeometry(0.06), color: 0xff6b6b },
        { geometry: new THREE.OctahedronGeometry(0.05), color: 0x4ecdc4 },
        { geometry: new THREE.BoxGeometry(0.08, 0.08, 0.08), color: 0x45b7d1 }
    ];
    
    const type = particleTypes[Math.floor(Math.random() * particleTypes.length)];
    
    const particleMaterial = new THREE.MeshBasicMaterial({
        color: type.color,
        transparent: true,
        opacity: Math.random() * 0.8 + 0.2
    });
    
    const particle = new THREE.Mesh(type.geometry, particleMaterial);
    particle.position.set(
        (Math.random() - 0.5) * 20,
        Math.random() * 10 + 1,
        (Math.random() - 0.5) * 20
    );
    
    particle.userData = {
        velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 0.03,
            Math.random() * 0.02 + 0.01,
            (Math.random() - 0.5) * 0.03
        ),
        life: Math.random() * 300 + 200,
        maxLife: Math.random() * 300 + 200,
        rotationSpeed: (Math.random() - 0.5) * 0.08,
        originalColor: type.color
    };
    
    sparkles.push(particle);
    scene.add(particle);
}

function createFloatingUIParticles() {
    setInterval(() => {
        if (Math.random() < 0.4) {
            const particle = document.createElement('div');
            particle.className = 'floating-particle';
            particle.style.left = Math.random() * window.innerWidth + 'px';
            particle.style.animationDelay = Math.random() * 2 + 's';
            particle.style.animationDuration = (3 + Math.random() * 2) + 's';
            
            document.body.appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
            }, 6000);
        }
    }, 300);
}

function createContinuousHTMLSparkles() {
    const sparkleOverlay = document.querySelector('.sparkle-overlay');
    
    setInterval(() => {
        if (Math.random() < 0.5) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle animate twinkle';
            sparkle.style.left = Math.random() * window.innerWidth + 'px';
            sparkle.style.top = window.innerHeight + 'px';
            sparkle.style.animationDelay = Math.random() * 1 + 's';
            sparkle.style.animationDuration = (2 + Math.random()) + 's';
            
            sparkleOverlay.appendChild(sparkle);
            
            setTimeout(() => {
                sparkle.remove();
            }, 4000);
        }
    }, 150);
}

function createVietnameseTextMesh() {
    // Enhanced 3D text with better effects
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 1200;
    canvas.height = 300;
    
    // Clear with transparency
    context.fillStyle = 'rgba(0, 0, 0, 0)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Enhanced text styling
    context.font = 'bold 90px Arial';
    context.fillStyle = '#FFD700';
    context.strokeStyle = '#FFA500';
    context.lineWidth = 6;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // Multiple glow layers
    context.shadowColor = '#FFD700';
    context.shadowBlur = 50;
    
    const text = 'Chị Hai Cho Em Tiền';
    
    // Draw multiple glow layers
    for (let i = 0; i < 3; i++) {
        context.shadowBlur = 20 + i * 15;
        context.strokeText(text, canvas.width / 2, canvas.height / 2);
    }
    
    context.shadowBlur = 0;
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    
    // Create enhanced texture
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    // Create 3D text mesh with premium material
    const textGeometry = new THREE.PlaneGeometry(10, 2.5);
    const textMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide
    });
    
    textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(0, 5, 0);
    scene.add(textMesh);
}

function createClickMeText3D() {
    // Create canvas for "Click Me" text
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 128;
    
    // Clear with transparency
    context.fillStyle = 'rgba(0, 0, 0, 0)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Enhanced text styling for Click Me
    context.font = 'bold 36px Arial';
    context.fillStyle = '#FFD700';
    context.strokeStyle = '#FFA500';
    context.lineWidth = 3;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // Add glow effect
    context.shadowColor = '#FFD700';
    context.shadowBlur = 20;
    
    const text = '👆 Click Me! 👆';
    
    // Draw text with glow
    context.strokeText(text, canvas.width / 2, canvas.height / 2);
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    
    // Create texture
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    // Create 3D "Click Me" mesh
    const clickGeometry = new THREE.PlaneGeometry(4, 1);
    const clickMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 1,
        side: THREE.DoubleSide
    });
    
    clickMeText = new THREE.Mesh(clickGeometry, clickMaterial);
    clickMeText.position.set(0, 5, 0); // Position above gift box
    clickMeText.userData = {
        originalY: 5,
        visible: true
    };
    
    scene.add(clickMeText);
}

function setupEventListeners() {
    document.addEventListener('click', handleEnhancedClick);
    document.addEventListener('mousemove', onEnhancedMouseMove);
    window.addEventListener('resize', onWindowResize);
    
    // Add hover effects for gift box
    renderer.domElement.addEventListener('mouseenter', () => {
        hoverEffect = true;
        playSound('click');
    });
    
    renderer.domElement.addEventListener('mouseleave', () => {
        hoverEffect = false;
    });
}

function onEnhancedMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Add subtle camera movement based on mouse
    if (camera) {
        camera.position.x += (mouse.x * 0.5 - camera.position.x) * 0.01;
        camera.position.y += ((-mouse.y * 0.5 + 5) - camera.position.y) * 0.01;
        camera.lookAt(0, 1, 0);
    }
}

function handleEnhancedClick(event) {
    if (!isOpened) {
        // Initialize audio context on first user interaction (required for mobile)
        if (!audioInitialized && audioContext && audioContext.state === 'suspended') {
            audioContext.resume();
        }
        
        // Initialize speech synthesis on first user interaction (required for mobile)
        if (!speechSupported && 'speechSynthesis' in window) {
            initTextToSpeech();
        }
        
        // Test speech synthesis on mobile on first click
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (isMobile && speechSynthesis) {
            // Prime the speech synthesis for mobile
            const testUtterance = new SpeechSynthesisUtterance("");
            testUtterance.volume = 0;
            speechSynthesis.speak(testUtterance);
            speechSynthesis.cancel();
        }
        
        audioInitialized = true;
        
        playSound('click');
        openUltraMagicalGiftBox();
        
        // Create click burst effect
        createClickBurstEffect(event);
    }
}

function createClickBurstEffect(event) {
    const burst = document.createElement('div');
    burst.className = 'magic-burst';
    burst.style.left = (event.clientX - 100) + 'px';
    burst.style.top = (event.clientY - 100) + 'px';
    
    document.body.appendChild(burst);
    
    setTimeout(() => {
        burst.remove();
    }, 2000);
}

function openUltraMagicalGiftBox() {
    if (isOpened) return;
    isOpened = true;
    
    console.log("🎁 Opening ultra magical gift box with premium effects!");
    
    // Play opening sound
    playSound('open');
    
    // Hide instructions with enhanced fade
    const instructions = document.getElementById('instructions');
    instructions.style.transition = 'all 1s ease';
    instructions.style.opacity = '0';
    instructions.style.transform = 'translateY(-50px)';
    
    // Hide 3D "Click Me" text
    if (clickMeText) {
        const fadeOut = () => {
            clickMeText.material.opacity -= 0.05;
            if (clickMeText.material.opacity > 0) {
                requestAnimationFrame(fadeOut);
            } else {
                clickMeText.visible = false;
            }
        };
        fadeOut();
    }
    
    // Enhanced box lid animation
    animateUltraBoxLidOpening();
    
    // Create massive magical explosion
    createUltraMagicalExplosion();
    
    // Enhanced camera effects
    addEnhancedCameraEffects();
    
    // Show Vietnamese text with premium effects
    setTimeout(() => {
        showEnhancedVietnameseText();
    }, 1800);
    
    // Add environmental effects
    addEnvironmentalEffects();
}

function animateUltraBoxLidOpening() {
    const duration = 3000;
    const startTime = Date.now();
    const startRotation = { x: 0, y: 0, z: 0 };
    const startPosition = { x: 0, y: 2.75, z: 0 };
    const targetRotation = { x: -Math.PI * 0.9, y: 0, z: 0 };
    const targetPosition = { x: 0, y: 3.5, z: -2.5 };
    
    function updateLid() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ultra smooth easing with bounce
        const easeOutElastic = progress === 1 ? 1 : 
            Math.pow(2, -10 * progress) * Math.sin((progress * 10 - 0.75) * (2 * Math.PI) / 3) + 1;
        
        // Update rotation with elastic ease
        boxLid.rotation.x = startRotation.x + (targetRotation.x - startRotation.x) * easeOutElastic;
        
        // Update position
        boxLid.position.y = startPosition.y + (targetPosition.y - startPosition.y) * easeOutElastic;
        boxLid.position.z = startPosition.z + (targetPosition.z - startPosition.z) * easeOutElastic;
        
        if (progress < 1) {
            requestAnimationFrame(updateLid);
        }
    }
    
    updateLid();
}

function createUltraMagicalExplosion() {
    // Create multiple waves of explosion particles
    const waves = 3;
    const particlesPerWave = 40;
    
    for (let wave = 0; wave < waves; wave++) {
        setTimeout(() => {
            for (let i = 0; i < particlesPerWave; i++) {
                setTimeout(() => {
                    const colors = [0xffd700, 0xff6b6b, 0x4ecdc4, 0x45b7d1, 0x96ceb4, 0xffeaa7, 0x74b9ff];
                    const color = colors[Math.floor(Math.random() * colors.length)];
                    
                    const geometries = [
                        new THREE.SphereGeometry(0.1, 8, 8),
                        new THREE.TetrahedronGeometry(0.12),
                        new THREE.OctahedronGeometry(0.1)
                    ];
                    const geometry = geometries[Math.floor(Math.random() * geometries.length)];
                    
                    const explosion = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
                        color: color,
                        transparent: true,
                        opacity: 1
                    }));
                    
                    explosion.position.set(0, 2.75, 0);
                    
                    const direction = new THREE.Vector3(
                        (Math.random() - 0.5) * 2,
                        Math.random() * 2 + 0.5,
                        (Math.random() - 0.5) * 2
                    ).normalize();
                    
                    explosion.userData = {
                        velocity: direction.multiplyScalar(0.2 + Math.random() * 0.15),
                        life: 120 + wave * 30,
                        gravity: -0.003,
                        rotationSpeed: (Math.random() - 0.5) * 0.2
                    };
                    
                    particles.push(explosion);
                    scene.add(explosion);
                }, i * 15);
            }
            
            playSound('magic');
        }, wave * 400);
    }
}

function addEnhancedCameraEffects() {
    const originalPosition = camera.position.clone();
    const duration = 2000;
    const startTime = Date.now();
    
    function enhancedShake() {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;
        
        if (progress < 1) {
            const intensity = (1 - progress) * 0.2;
            const time = elapsed * 0.01;
            
            camera.position.x = originalPosition.x + Math.sin(time * 3) * intensity;
            camera.position.y = originalPosition.y + Math.cos(time * 4) * intensity;
            camera.position.z = originalPosition.z + Math.sin(time * 2) * intensity * 0.5;
            
            camera.lookAt(0, 1, 0);
            
            requestAnimationFrame(enhancedShake);
        } else {
            camera.position.copy(originalPosition);
            camera.lookAt(0, 1, 0);
        }
    }
    
    enhancedShake();
}

function showEnhancedVietnameseText() {
    console.log("✨ Showing Vietnamese text with premium effects!");
    
    // Show HTML text with enhanced animation
    const textElement = document.getElementById('vietnameseText');
    textElement.classList.add('show');
    
    // Play magic sound
    playSound('magic');
    
    // Check mobile and speech support
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    console.log("📱 Is mobile:", isMobile);
    console.log("🗣️ Speech supported:", speechSupported);
    console.log("🗣️ speechSynthesis available:", !!window.speechSynthesis);
    
    // Speak the Vietnamese text with longer delay for mobile
    const speechDelay = isMobile ? 2000 : 1000;
    setTimeout(() => {
        console.log("🗣️ Attempting to speak text...");
        speakVietnameseText("Chị Hai Cho Em Tiền");
    }, speechDelay);
    
    // Show speech control button after text is shown
    setTimeout(() => {
        showSpeechControl();
    }, speechDelay + 1000);
    
    // Animate 3D text mesh with premium effects
    if (textMesh) {
        const duration = 4000;
        const startTime = Date.now();
        
        function updateText3D() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeOutBack = 1 + 2.7 * Math.pow(progress - 1, 3) + 1.7 * Math.pow(progress - 1, 2);
            
            textMesh.material.opacity = progress;
            textMesh.position.y = 5 + Math.sin(progress * Math.PI) * 2;
            textMesh.rotation.y = progress * Math.PI * 3;
            textMesh.scale.setScalar(0.5 + easeOutBack * 0.5);
            
            if (progress < 1) {
                requestAnimationFrame(updateText3D);
            }
        }
        
        updateText3D();
    }
}

function addEnvironmentalEffects() {
    // Change lighting to more magical
    scene.children.forEach(child => {
        if (child.type === 'PointLight' && child.color.getHex() === 0xffd700) {
            const originalIntensity = child.intensity;
            let time = 0;
            
            function animateLight() {
                time += 0.05;
                child.intensity = originalIntensity + Math.sin(time) * 0.5;
                
                if (time < 10) {
                    requestAnimationFrame(animateLight);
                }
            }
            
            animateLight();
        }
    });
}

function updateAdvancedParticles() {
    // Update explosion particles
    particles.forEach((particle, index) => {
        particle.position.add(particle.userData.velocity);
        particle.userData.velocity.y += particle.userData.gravity;
        particle.userData.life -= 2;
        
        // Rotate particles
        particle.rotation.x += particle.userData.rotationSpeed;
        particle.rotation.y += particle.userData.rotationSpeed * 0.7;
        particle.rotation.z += particle.userData.rotationSpeed * 0.5;
        
        // Fade and scale particles
        const lifeRatio = particle.userData.life / 120;
        particle.material.opacity = Math.max(0, lifeRatio);
        particle.scale.setScalar(1 + (1 - lifeRatio) * 2);
        
        if (particle.userData.life <= 0) {
            scene.remove(particle);
            particles.splice(index, 1);
        }
    });
    
    // Update magical ambient particles
    sparkles.forEach((particle, index) => {
        particle.position.add(particle.userData.velocity);
        
        // Advanced rotation
        particle.rotation.x += particle.userData.rotationSpeed;
        particle.rotation.y += particle.userData.rotationSpeed * 0.8;
        particle.rotation.z += particle.userData.rotationSpeed * 0.6;
        
        particle.userData.life -= 1;
        
        // Color cycling effect
        const time = Date.now() * 0.001;
        const hue = (time + index * 0.1) % 1;
        particle.material.color.setHSL(hue, 0.7, 0.5);
        
        // Breathing opacity effect
        const lifeRatio = particle.userData.life / particle.userData.maxLife;
        particle.material.opacity = (lifeRatio * 0.8) * (0.5 + Math.sin(time * 3 + index) * 0.3);
        particle.scale.setScalar(0.8 + Math.sin(time * 2 + index) * 0.4);
        
        // Reset particle when it dies
        if (particle.userData.life <= 0) {
            particle.position.set(
                (Math.random() - 0.5) * 20,
                -1,
                (Math.random() - 0.5) * 20
            );
            particle.userData.life = particle.userData.maxLife;
        }
        
        // Boundary check
        if (particle.position.y > 12) {
            particle.position.y = -1;
        }
    });
    
    // Update floating decorations
    floatingParticles.forEach((particle, index) => {
        const time = Date.now() * 0.001;
        particle.position.y = particle.userData.originalPosition.y + 
            Math.sin(time * 2 + particle.userData.floatOffset) * 0.3;
        particle.rotation.y += particle.userData.rotationSpeed;
        particle.rotation.x += particle.userData.rotationSpeed * 0.5;
    });
}

function setupAdvancedEffects() {
    // This is where we would add post-processing like bloom, etc.
    // For now, keeping it performant but this is the extension point
}

function animate() {
    animationId = requestAnimationFrame(animate);
    
    const time = clock.getElapsedTime();
    
    // Enhanced gift box animation
    if (giftBox && !isOpened) {
        // Gentle floating with breathing effect
        giftBox.rotation.y = Math.sin(time * 0.4) * 0.15;
        giftBox.position.y = giftBoxOriginalY + Math.sin(time * 1.5) * 0.08;
        
        // Add hover effect
        if (hoverEffect) {
            giftBox.scale.setScalar(1 + Math.sin(time * 8) * 0.02);
        } else {
            giftBox.scale.setScalar(1);
        }
    }
    
    // Animate "Click Me" text above gift box
    if (clickMeText && !isOpened) {
        clickMeText.position.y = clickMeText.userData.originalY + Math.sin(time * 2) * 0.2;
        clickMeText.rotation.y = Math.sin(time) * 0.1;
        
        // Pulsing effect
        const pulse = 1 + Math.sin(time * 3) * 0.1;
        clickMeText.scale.set(pulse, pulse, pulse);
        
        // Glow effect by changing opacity
        clickMeText.material.opacity = 0.8 + Math.sin(time * 4) * 0.2;
        
        // Always face camera
        clickMeText.lookAt(camera.position);
    }
    
    // Enhanced 3D text animation
    if (textMesh && isOpened) {
        textMesh.position.y += Math.sin(time * 3) * 0.008;
        textMesh.rotation.y += 0.008;
        
        // Add subtle scale breathing
        const breathe = 1 + Math.sin(time * 2) * 0.05;
        textMesh.scale.set(breathe, breathe, breathe);
    }
    
    // Update all particle systems
    updateAdvancedParticles();
    
    // Animate lights for ultra magical effect
    const lights = scene.children.filter(child => child.type === 'PointLight');
    lights.forEach((light, index) => {
        const originalIntensity = light.userData?.originalIntensity || light.intensity;
        light.userData.originalIntensity = originalIntensity;
        
        light.intensity = originalIntensity + Math.sin(time * 2 + index * 1.2) * 0.4;
        
        // Move lights slightly
        if (light.color.getHex() !== 0xffd700) {
            light.position.x += Math.sin(time + index) * 0.02;
            light.position.z += Math.cos(time + index) * 0.02;
        }
    });
    
    // Render the scene
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Initialize when page loads
window.addEventListener('load', () => {
    console.log("🎁 Page loaded, initializing ultra magical gift box...");
    init();
});

// Function to repeat speech
function repeatSpeech() {
    speakVietnameseText("Chị Hai Cho Em Tiền");
    
    // Add visual feedback
    const button = document.getElementById('speakButton');
    button.style.transform = 'scale(0.9)';
    setTimeout(() => {
        button.style.transform = 'scale(1)';
    }, 150);
}

// Function to show speech control
function showSpeechControl() {
    const speechControl = document.getElementById('speechControl');
    speechControl.classList.add('show');
}
