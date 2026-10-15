import 'package:flutter/widgets.dart';
import 'package:super_heng_bullion/session.dart';

class AppText {
  AppText(String locale) : zh = locale == 'zh-Hant' || locale.startsWith('zh');

  final bool zh;

  static AppText of(BuildContext context) => AppText(SessionScope.of(context).locale);

  String pick(String en, String zhHant) => zh ? zhHant : en;

  String message(String value) => zh ? (_known[value] ?? value) : value;

  String methodLabel(String value) {
    switch (value) {
      case 'deposit':
        return deposit;
      case 'withdrawal':
        return withdraw;
      case 'transfer':
        return transfer;
      case '':
        return all;
      default:
        return message(value);
    }
  }

  String statusLabel(String value) {
    switch (value) {
      case 'pending':
        return pending;
      case 'approved':
        return approved;
      case 'declined':
      case 'rejected':
        return declined;
      case '':
        return all;
      default:
        return message(value);
    }
  }

  String get tradeBook => pick('Trade Book', '交易簿');
  String get price => pick('Price', '報價');
  String get marketOpen => pick('OPEN', '開市');
  String get sell => pick('Sell', '賣出');
  String get buy => pick('Buy', '買入');
  String get buyPrice => pick('BUY PRICE', '買入價');
  String get sellPrice => pick('SELL PRICE', '賣出價');
  String get lineChart => pick('Line', '折線');
  String get candleChart => pick('Candles', '蠟燭');
  String get trade => pick('Trade', '交易');
  String get assets => pick('Assets', '資產');
  String get hub => pick('Hub', '我的');
  String get comingSoon => pick('Coming Soon', '即將推出');
  String get deposit => pick('Deposit', '入金');
  String get withdraw => pick('Withdraw', '出金');
  String get transfer => pick('Transfer', '轉帳');
  String get fund => pick('Fund', '資金');
  String get tradingLimit => pick('Trading Limit', '交易限額');
  String get goldAccount => pick('Gold Account', '黃金帳戶');
  String get fundAccount => pick('Fund Account', '資金帳戶');
  String get history => pick('History', '紀錄');
  String get allMethod => pick('All Method', '全部方式');
  String get allStatus => pick('All Status', '全部狀態');
  String get filter => pick('Filter', '篩選');
  String get method => pick('Method', '方式');
  String get status => pick('Status', '狀態');
  String get all => pick('All', '全部');
  String get reset => pick('Reset', '重設');
  String get apply => pick('Apply', '套用');
  String get startDate => pick('Start date', '開始日期');
  String get endDate => pick('End date', '結束日期');
  String get noData => pick('No Available Data', '暫無數據');
  String get physicalGold => pick('Physical Gold', '實物黃金');
  String get bankTransfer => pick('Bank Transfer', '銀行轉帳');
  String get myInformation => pick('My Information', '我的資料');
  String get superHengInformation => pick('SuperHeng Information', 'SuperHeng 資料');
  String get customerSupport => pick('Customer support', '客戶服務');
  String get unselected => pick('Unselected', '未選擇');
  String get depositMethod => pick('Deposit Method', '入金方式');
  String get depositInstructions => pick('Deposit Instructions', '入金說明');
  String get withdrawalMethod => pick('Withdrawal Method', '出金方式');
  String get withdrawalAmount => pick('Withdrawal Amount', '出金金額');
  String get withdrawalQuantity => pick('Withdrawal Quantity(g)', '出金數量(克)');
  String goldBalance(String grams) => pick('Gold Balance: $grams g', '黃金餘額：$grams 克');
  String fundBalance(String amount) => pick('Fund Balance: RM $amount', '資金餘額：RM $amount');
  String get submit => pick('Submit', '提交');
  String get submitting => pick('Submitting…', '提交中…');
  String get selectBankAccount => pick('Select Bank Account', '選擇銀行帳戶');
  String get addBankAccount => pick('Add Bank Account', '新增銀行帳戶');
  String get bankInformation => pick('Bank Information', '銀行資料');
  String get bankAccount => pick('Bank Account', '銀行帳戶');
  String get accountHolderName => pick('Account Holder Name', '帳戶持有人姓名');
  String get bankName => pick('Bank Name', '銀行名稱');
  String get uploadScreenshot => pick('Upload Screenshot', '上傳截圖');
  String get uploadPhoto => pick('Upload Photo', '上傳照片');
  String get comment => pick('Comment', '備註');
  String get jpgHint => pick('* JPG, JPEG, and PNG files under 5MB.', '* 僅支援 JPG、JPEG 和 PNG，大小不超過 5MB。');
  String get transferQuantity => pick('Transfer Quantity(g)', '轉帳數量(克)');
  String get goldTransfer => pick('Gold Transfer', '黃金轉帳');
  String get recipientUser => pick('Recipient User', '收款用戶');
  String get transferNotes => pick('Transfer notes\nThe XAU will be verified by the administrator.', '轉帳說明\n管理員將核實 XAU。');
  String get personalInformation => pick('Personal Information', '個人資料');
  String get language => pick('Language', '語言');
  String get changePassword => pick('Change Password', '更改密碼');
  String get logOut => pick('Log Out', '登出');
  String get announcement => pick('Announcement', '公告');
  String get unread => pick('Unread', '未讀');
  String get read => pick('Read', '已讀');
  String get copied => pick('Copied', '已複製');
  String get languageSaved => pick('Language saved', '語言已儲存');
  String get passwordUpdated => pick('Password updated', '密碼已更新');
  String get currentPassword => pick('Current Password', '目前密碼');
  String get newPassword => pick('New Password', '新密碼');
  String get confirmNewPassword => pick('Confirm New Password', '確認新密碼');
  String get save => pick('Save', '儲存');
  String get username => pick('Username', '用戶名');
  String get password => pick('Password', '密碼');
  String get email => pick('Email', '電郵');
  String get name => pick('Name', '姓名');
  String get phone => pick('Phone', '電話');
  String get address => pick('Address', '地址');
  String get company => pick('Company', '公司');
  String get personal => pick('Personal', '個人');
  String get registrationNumber => pick('Registration Number', '註冊編號');
  String get deleteAccount => pick('Delete Account', '刪除帳戶');
  String get deleteAccountBody => pick('Please contact customer support to delete your account.', '請聯絡客戶服務以刪除帳戶。');
  String get close => pick('Close', '關閉');
  String get editProfile => pick('Edit Profile', '編輯資料');
  String get profileUpdated => pick('Profile updated', '資料已更新');
  String get pending => pick('pending', '待審核');
  String get approved => pick('approved', '已批准');
  String get declined => pick('declined', '已拒絕');
  String get info => pick('Info', '資訊');
  String get contact => pick('CONTACT', '聯絡');
  String get about => pick('About', '關於');
  String get terms => pick('Terms', '條款');
  String get openInMaps => pick('Open in Maps', '在地圖中開啟');
  String version(String number) => pick('Version $number', '版本 $number');
  String office(bool many) => many ? pick('OFFICES', '辦事處') : pick('OFFICE', '辦事處');
  String get companyLabel => pick('COMPANY', '公司');
  String get signIn => pick('Sign in', '登入');
  String get signingIn => pick('Signing in…', '登入中…');
  String get required => pick('Required', '必填');
  String get cannotReach => pick('Cannot reach the server.', '無法連接伺服器。');
  String get member => pick('MEMBER', '會員');
  String get signInHint => pick(
        'Use your username and password to view rates and manage your profile.',
        '使用用戶名和密碼查看報價及管理資料。',
      );
  String get xauWithdrawNotes => pick(
        '1. Please contact customer support for assistance with withdrawing XAU.\n2. The administrator will review and record the quantity of XAU.',
        '1. 出金 XAU 請聯絡客戶服務。\n2. 管理員將審核並記錄 XAU 數量。',
      );
  String get fundWithdrawNotes => pick(
        '1. Please select a verified account and enter the amount to be withdrawn.\n2. The amount will be verified and recorded by the administrator.',
        '1. 請選擇已驗證帳戶並輸入出金金額。\n2. 金額將由管理員核實並記錄。',
      );
  String get bankReviewNote => pick(
        'Notes\nYour submission is pending review by SuperHeng. Please call us if you have any questions.',
        '備註\n您的提交正在等待 SuperHeng 審核。如有疑問，請致電我們。',
      );
  String get bankWaiting => pick('Your bank account is waiting for review.', '您的銀行帳戶正在等待審核。');
  String get depositWaiting => pick('Your deposit is waiting for review.', '您的入金正在等待審核。');
  String get withdrawalSubmitted => pick('Withdrawal submitted. The amount has been deducted.', '出金已提交，金額已扣除。');
  String get transferWaiting => pick('Your transfer is waiting for review.', '您的轉帳正在等待審核。');
  String get selectVerifiedBank => pick('Select a verified bank account.', '請選擇已驗證的銀行帳戶。');
  String get uploadRequired => pick('Upload a screenshot of the transfer.', '請上傳轉帳截圖。');
}

const _known = {
  'Use a JPG or PNG file.': '請使用 JPG 或 PNG 檔案。',
  'Please choose a file.': '請選擇檔案。',
  'File must be under 5MB.': '檔案必須小於 5MB。',
  'Cannot reach the server.': '無法連接伺服器。',
  'SuperHeng Gold Information': 'SuperHeng 黃金資料',
  'Please transfer owed to this SuperHeng Gold Bank Account using a verified account.': '請使用已驗證帳戶轉帳至 SuperHeng 黃金銀行帳戶。',
  'Upload a screenshot of the transfer after completion.': '完成轉帳後請上傳截圖。',
  'The amount will be verified and recorded by the administrator.': '金額將由管理員核實並記錄。',
  'If you have any questions, please contact our customer support.': '如有疑問，請聯絡客戶服務。',
  'Please contact SuperHeng Gold customer support for assistance with deposit.': '入金請聯絡 SuperHeng 黃金客戶服務。',
  'The administrator will review and record the quantity of gold received.': '管理員將審核並記錄收到的黃金數量。',
  'Select a verified bank account.': '請選擇已驗證的銀行帳戶。',
  'Upload a screenshot of the transfer.': '請上傳轉帳截圖。',
  'Amount is above your balance.': '金額超過您的餘額。',
  'Enter an amount greater than 0.': '請輸入大於 0 的金額。',
};
