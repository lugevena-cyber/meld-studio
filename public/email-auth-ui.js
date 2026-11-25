const emailAuthUI={mailConfigured:false,checked:false,busy:false,submitting:false,sentEmail:'',sentPurpose:'',cooldowns:new Map(),timer:null,configured:false};
const emailAuthElement=id=>document.getElementById(id);
function normalizedAuthEmail(){return els.authEmailInput.value.trim().toLowerCase();}
function emailAuthCodeMode(){return authMode==='signup'||authMode==='reset';}
function emailAuthHasCode(){return emailAuthUI.sentEmail===normalizedAuthEmail()&&emailAuthUI.sentPurpose===authMode;}
function updateEmailAuthFields(){
 const needsCode=emailAuthCodeMode(),hasCode=emailAuthHasCode();
 emailAuthElement('authCodeBlock').hidden=!needsCode;
 emailAuthElement('authCodeLabel').hidden=!needsCode||!hasCode;
 emailAuthElement('authCodeInput').required=needsCode&&hasCode;
 emailAuthElement('authPasswordLabel').hidden=needsCode&&!hasCode;
 els.authPasswordInput.required=!needsCode||hasCode;
 els.authPasswordInput.minLength=8;els.authPasswordInput.maxLength=16;
 els.authPasswordInput.pattern='(?=.*[A-Za-z])(?=.*[0-9])[A-Za-z0-9]{8,16}';
 els.authPasswordInput.autocomplete=authMode==='login'?'current-password':'new-password';
 emailAuthElement('authConfirmLabel').hidden=!needsCode||!hasCode;
 emailAuthElement('authConfirmInput').required=needsCode&&hasCode;
 emailAuthElement('authForgotBtn').hidden=authMode!=='login';
 emailAuthElement('authPasswordCaption').textContent=authMode==='reset'?'新的 Melohum 网站密码':'Melohum 网站密码';
 els.authSubmitBtn.disabled=emailAuthUI.busy||emailAuthUI.submitting||(needsCode&&!hasCode);
 for(const element of [els.authEmailInput,els.authPasswordInput,emailAuthElement('authConfirmInput'),emailAuthElement('authCodeInput'),emailAuthElement('authForgotBtn'),...els.authTabs.querySelectorAll('button')])element.disabled=emailAuthUI.submitting;
 const button=emailAuthElement('authSendCodeBtn'),remaining=Math.max(0,Math.ceil(((emailAuthUI.cooldowns.get(normalizedAuthEmail())||0)-Date.now())/1000));
 button.disabled=emailAuthUI.busy||emailAuthUI.submitting||!emailAuthUI.mailConfigured||remaining>0;
 button.textContent=remaining?`${remaining} 秒后可重发`:hasCode?'重新发送验证码':'发送验证码';
 emailAuthElement('authCodeHint').textContent=hasCode?'验证码已发送，10 分钟内有效。请填写验证码并设置本站密码。':'先输入邮箱并获取验证码，再设置本站密码。';
}
function setEmailAuthMode(mode){
 authMode=['signup','reset'].includes(mode)?mode:'login';
 els.authTabs.querySelectorAll('[data-auth-mode]').forEach(button=>button.classList.toggle('active',button.dataset.authMode===authMode));
 els.authTitle.textContent=authMode==='signup'?'创建 Melohum 账户':authMode==='reset'?'找回 Melohum 密码':'邮箱登录 Melohum';
 els.authCopy.textContent=authMode==='signup'?'邮箱就是你的账号。验证邮箱后，设置一份专用于 Melohum 的密码。':authMode==='reset'?'验证注册邮箱后设置新密码，原有作品和素材会保留。':'使用注册邮箱和 Melohum 网站密码，继续你的云端创作。';
 els.authSubmitBtn.textContent=authMode==='signup'?'验证邮箱并注册':authMode==='reset'?'验证并重置密码':'登录并同步';
 els.authMessage.textContent='';els.authMessage.classList.remove('success');
 els.authPasswordInput.value='';emailAuthElement('authConfirmInput').value='';emailAuthElement('authCodeInput').value='';
 updateEmailAuthFields();
}
async function refreshEmailAuthConfig(){
 try{const config=await window.MeldCloud.authConfig();emailAuthUI.mailConfigured=config.mailConfigured===true;emailAuthUI.checked=true;
  const providers=config.socialProviders||[],social=emailAuthElement('authSocial');
  social.hidden=Boolean(cloudSession)||!providers.length;
  for(const link of social.querySelectorAll('[data-social-provider]')){
   link.hidden=!providers.includes(link.dataset.socialProvider);
   link.href=`/api/auth/${link.dataset.socialProvider}/start?page=${encodeURIComponent(state.currentView)}`;
  }
  const message=emailAuthElement('authServiceStatus');message.textContent=emailAuthUI.mailConfigured?'':'邮箱验证码服务尚未开通，请使用已启用的登录方式。';message.hidden=Boolean(cloudSession)||emailAuthUI.mailConfigured;
 }catch{const message=emailAuthElement('authServiceStatus');message.textContent='暂时无法连接账户服务，请稍后重试。';message.hidden=Boolean(cloudSession);}
 updateEmailAuthFields();
}
function validateEmailAuthForm(){
 if(!/^(?=.*[A-Za-z])(?=.*[0-9])[A-Za-z0-9]{8,16}$/.test(els.authPasswordInput.value)){els.authMessage.textContent='密码须为 8–16 位，仅限字母和数字，且两者都要包含';return false;}
 if(emailAuthCodeMode()){
  if(!emailAuthHasCode()){els.authMessage.textContent='请先向当前邮箱发送验证码';return false;}
  if(!/^\d{6}$/.test(emailAuthElement('authCodeInput').value.trim())){els.authMessage.textContent='请输入邮件中的 6 位验证码';return false;}
  if(els.authPasswordInput.value!==emailAuthElement('authConfirmInput').value){els.authMessage.textContent='两次输入的本站密码不一致';return false;}
 }
 return true;
}
async function sendEmailAuthCode(){
 if(emailAuthUI.busy||!emailAuthCodeMode())return;
 if(!els.authEmailInput.reportValidity())return;
 const email=normalizedAuthEmail(),mode=authMode;
 emailAuthUI.busy=true;updateEmailAuthFields();els.authMessage.textContent='正在发送验证码…';els.authMessage.classList.remove('success');
 try{
  const result=await window.MeldCloud.sendCode(email,mode==='signup'?'signup':'reset');
  emailAuthUI.cooldowns.set(email,Date.now()+result.retryAfter*1000);
  if(normalizedAuthEmail()===email&&authMode===mode){emailAuthUI.sentEmail=email;emailAuthUI.sentPurpose=mode;els.authMessage.textContent=result.message;els.authMessage.classList.add('success');}
 }catch(error){els.authMessage.textContent=error.message;}finally{emailAuthUI.busy=false;updateEmailAuthFields();}
}
function setupEmailAuth(){
 if(emailAuthUI.configured)return;emailAuthUI.configured=true;
 emailAuthElement('authSendCodeBtn').addEventListener('click',sendEmailAuthCode);
 emailAuthElement('authForgotBtn').addEventListener('click',()=>setAuthMode('reset'));
 els.authEmailInput.addEventListener('input',()=>{if(emailAuthCodeMode()&&!emailAuthHasCode()){emailAuthElement('authCodeInput').value='';els.authPasswordInput.value='';emailAuthElement('authConfirmInput').value='';}updateEmailAuthFields();});
 emailAuthUI.timer=window.setInterval(()=>{if(els.authDialog.open)updateEmailAuthFields();},1000);
 refreshEmailAuthConfig();
}
