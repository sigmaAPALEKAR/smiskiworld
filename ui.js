export class UIManager {
    constructor(smiskis, onFollowCallback) {
        this.smiskis = smiskis;
        this.onFollowCallback = onFollowCallback;
        this.selectedSmiski = null;
        this.panelVisible = false;
        
        this.initButtons();
        this.initPanel();
    }
    
    setSmiskis(smiskis) {
        this.smiskis = smiskis;
    }
    
    initButtons() {
        const buttons = document.querySelectorAll('.smiski-btn');
        buttons.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                this.selectSmiski(index);
                this.onFollowCallback(index);
            });
        });
    }
    
    initPanel() {
        document.getElementById('panel-close').addEventListener('click', () => {
            this.hidePanel();
        });
    }
    
    selectSmiski(index) {
        this.selectedSmiski = index;
        
        // Update button states
        document.querySelectorAll('.smiski-btn').forEach((b, i) => {
            b.classList.toggle('active', i === index);
        });
        document.getElementById('freecam-btn').classList.remove('active');
        
        this.showSmiskiPanel(index);
    }
    
    showSmiskiPanel(index) {
        if (!this.smiskis || !this.smiskis[index]) return;
        
        const smiski = this.smiskis[index];
        const panel = document.getElementById('smiski-panel');
        
        document.getElementById('panel-avatar').style.background = 
            '#' + smiski.color.toString(16).padStart(6, '0');
        document.getElementById('panel-name').textContent = smiski.name;
        
        const statusEmojis = {
            'sleeping': '😴', 'eating': '🍽️', 'walking': '🚶',
            'exploring': '🔍', 'gardening': '🌱', 'playing': '🎮',
            'sitting': '💺', 'idle': '💭'
        };
        
        document.getElementById('panel-status').textContent = 
            (statusEmojis[smiski.state] || '❓') + ' ' + smiski.state;
        document.getElementById('panel-activity').textContent = 
            smiski.state.charAt(0).toUpperCase() + smiski.state.slice(1);
        document.getElementById('panel-mood').textContent = smiski.mood;
        document.getElementById('panel-energy').style.width = smiski.energy + '%';
        
        panel.classList.remove('hidden');
        this.panelVisible = true;
    }
    
    hidePanel() {
        document.getElementById('smiski-panel').classList.add('hidden');
        this.panelVisible = false;
    }
    
    updateSmiskiButtons() {
        if (!this.smiskis) return;
        
        const buttons = document.querySelectorAll('.smiski-btn');
        buttons.forEach((btn, i) => {
            if (this.smiskis[i]) {
                const statusSpan = btn.querySelector('.smiski-btn-status');
                const statusEmojis = {
                    'sleeping': '😴', 'eating': '🍽️', 'walking': '🚶',
                    'exploring': '🔍', 'gardening': '🌱', 'playing': '🎮',
                    'sitting': '💺', 'idle': '💭'
                };
                statusSpan.textContent = (statusEmojis[this.smiskis[i].state] || '❓') + 
                    ' ' + this.smiskis[i].state;
            }
        });
        
        // Update panel if visible
        if (this.panelVisible && this.selectedSmiski !== null) {
            this.showSmiskiPanel(this.selectedSmiski);
        }
    }
}
