class PasswordGenerator {
    constructor() {
        this.characters = {
            uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            lowercase: 'abcdefghijklmnopqrstuvwxyz',
            numbers: '0123456789',
        };
        
        this.initializeElements();
        this.bindEvents();
        this.updateLengthDisplay();
    }
    
    initializeElements() {
        this.lengthSlider = document.getElementById('length');
        this.lengthValue = document.getElementById('lengthValue');
        this.uppercaseCheck = document.getElementById('uppercase');
        this.lowercaseCheck = document.getElementById('lowercase');
        this.numbersCheck = document.getElementById('numbers');
        this.symbolsCheck = document.getElementById('symbols');
        this.symbolsChars = document.getElementById('symbolsChars');
        this.excludeConfusingCheck = document.getElementById('excludeConfusing');
        this.generateBtn = document.getElementById('generateBtn');
        this.passwordOutput = document.getElementById('passwordOutput');
        this.copyBtn = document.getElementById('copyBtn');
        this.strengthText = document.getElementById('strengthText');
        this.strengthFill = document.getElementById('strengthFill');
        this.feedback = document.getElementById('feedback');
    }
    
    bindEvents() {
        this.lengthSlider.addEventListener('input', () => this.updateLengthDisplay());
        this.generateBtn.addEventListener('click', () => this.generatePassword());
        this.copyBtn.addEventListener('click', () => this.copyToClipboard());
        
        [this.uppercaseCheck, this.lowercaseCheck, this.numbersCheck, this.symbolsCheck]
            .forEach(checkbox => {
                checkbox.addEventListener('change', () => this.validateInputs());
            });
        this.symbolsChars.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^\x21-\x2f\x3a-\x40\x5b-\x60\x7b-\x7e]/g, '');
        });
    }
    
    updateLengthDisplay() {
        this.lengthValue.textContent = this.lengthSlider.value;
    }
    
    validateInputs() {
        const checkboxes = [this.uppercaseCheck, this.lowercaseCheck, this.numbersCheck, this.symbolsCheck];
        const checkedBoxes = checkboxes.filter(cb => cb.checked);
        
        if (checkedBoxes.length === 0) {
            this.showFeedback('最低1つの文字種類を選択してください', 'error');
            this.generateBtn.disabled = true;
            return false;
        }

        if (this.symbolsCheck.checked && this.symbolsChars.value.trim() === '') {
            this.showFeedback('使用する記号を入力してください', 'error');
            this.generateBtn.disabled = true;
            return false;
        }
        
        this.generateBtn.disabled = false;
        this.hideFeedback();
        return true;
    }
    
    getSecureRandomInt(max) {
        const array = new Uint32Array(1);
        window.crypto.getRandomValues(array);
        return array[0] % max;
    }
    
    generatePassword() {
        if (!this.validateInputs()) {
            return;
        }
        
        const length = parseInt(this.lengthSlider.value);
        let characterSet = '';

        let uppercaseChars = this.characters.uppercase;
        let lowercaseChars = this.characters.lowercase;
        let numbersChars = this.characters.numbers;
        let symbolsChars = this.symbolsChars.value;

        if (this.excludeConfusingCheck.checked) {
            const confusingRegex = /[Ilji1Oo0]/g;
            uppercaseChars = uppercaseChars.replace(confusingRegex, '');
            lowercaseChars = lowercaseChars.replace(confusingRegex, '');
            numbersChars = numbersChars.replace(confusingRegex, '');
            symbolsChars = symbolsChars.replace(confusingRegex, '');
        }
        
        if (this.uppercaseCheck.checked) characterSet += uppercaseChars;
        if (this.lowercaseCheck.checked) characterSet += lowercaseChars;
        if (this.numbersCheck.checked) characterSet += numbersChars;
        if (this.symbolsCheck.checked) characterSet += symbolsChars;

        if (characterSet.length === 0) {
            this.showFeedback('選択された文字種ではパスワードを生成できません。文字種設定を確認してください。', 'error');
            this.generateBtn.disabled = true;
            return;
        }
        
        let password = '';
        
        const selectedTypes = [];
        if (this.uppercaseCheck.checked && uppercaseChars.length > 0) selectedTypes.push(uppercaseChars);
        if (this.lowercaseCheck.checked && lowercaseChars.length > 0) selectedTypes.push(lowercaseChars);
        if (this.numbersCheck.checked && numbersChars.length > 0) selectedTypes.push(numbersChars);
        if (this.symbolsCheck.checked && symbolsChars.length > 0) selectedTypes.push(symbolsChars);
        
        for (let i = 0; i < selectedTypes.length && i < length; i++) {
            const typeChars = selectedTypes[i];
            password += typeChars[this.getSecureRandomInt(typeChars.length)];
        }
        
        for (let i = password.length; i < length; i++) {
            password += characterSet[this.getSecureRandomInt(characterSet.length)];
        }
        
        password = this.shuffleString(password);
        
        this.passwordOutput.value = password;
        this.copyBtn.disabled = false;
        this.updatePasswordStrength(password);
    }
    
    shuffleString(str) {
        const array = str.split('');
        for (let i = array.length - 1; i > 0; i--) {
            const j = this.getSecureRandomInt(i + 1);
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array.join('');
    }
    
    updatePasswordStrength(password) {
        const length = password.length;
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumbers = /[0-9]/.test(password);
        const symbolsRegex = new RegExp(`[${this.symbolsChars.value.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}]`);
        const hasSymbols = this.symbolsCheck.checked && this.symbolsChars.value ? symbolsRegex.test(password) : false;

        let score = 0;
        let strengthText = '';
        let strengthClass = '';
        let fillWidth = 0;
        
        if (length >= 8) score += 1;
        if (length >= 12) score += 1;
        if (length >= 16) score += 1;
        if (hasUpper) score += 1;
        if (hasLower) score += 1;
        if (hasNumbers) score += 1;
        if (hasSymbols) score += 1;
        
        if (score <= 3) {
            strengthText = '弱い';
            strengthClass = 'strength-weak';
            fillWidth = 25;
        } else if (score <= 4) {
            strengthText = '普通';
            strengthClass = 'strength-normal';
            fillWidth = 50;
        } else if (score <= 5) {
            strengthText = '安全';
            strengthClass = 'strength-safe';
            fillWidth = 75;
        } else {
            strengthText = '非常に安全';
            strengthClass = 'strength-very-safe';
            fillWidth = 100;
        }
        
        this.strengthText.textContent = strengthText;
        this.strengthFill.className = `strength-fill ${strengthClass}`;
        this.strengthFill.style.width = `${fillWidth}%`;
    }
    
    async copyToClipboard() {
        try {
            await navigator.clipboard.writeText(this.passwordOutput.value);
            this.showFeedback('パスワードをコピーしました！', 'success');
        } catch (err) {
            this.showFeedback('コピーに失敗しました', 'error');
        }
    }
    
    showFeedback(message, type) {
        this.feedback.textContent = message;
        this.feedback.className = `feedback ${type} show`;
        
        setTimeout(() => {
            this.hideFeedback();
        }, 3000);
    }
    
    hideFeedback() {
        this.feedback.classList.remove('show');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PasswordGenerator();
});