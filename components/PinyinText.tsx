import React from 'react';

interface PinyinTextProps {
  pinyin: string;
  text: string;
  size?: 'sm' | 'md' | 'lg';
}

const PinyinText: React.FC<PinyinTextProps> = ({ pinyin, text, size = 'md' }) => {
  // 清理拼音：按空格分割，移除西文标点
  const pinyinSyllables = pinyin
    .replace(/[,.\!\?]/g, '')
    .split(/\s+/)
    .filter((p) => p.trim());

  // 中文标点
  const chinesePunctuation = /[，。！？、；：""''（）《》【】\s]/;

  // 分割文本为字符
  const chars = text.split('');

  let syllableIndex = 0;

  // 根据 size 设置样式
  const sizeStyles = {
    sm: { pinyin: 'text-xs', char: 'text-base md:text-lg' },
    md: { pinyin: 'text-xs md:text-sm', char: 'text-xl md:text-2xl' },
    lg: { pinyin: 'text-sm md:text-base', char: 'text-2xl md:text-3xl' },
  };

  const styles = sizeStyles[size];

  return (
    <div className="flex flex-wrap justify-center items-end gap-x-1 gap-y-3">
      {chars.map((char, i) => {
        if (chinesePunctuation.test(char)) {
          // 标点符号，不显示拼音
          return (
            <span key={i} className={`font-heading ${styles.char} text-primary-800`}>
              {char}
            </span>
          );
        }

        // 汉字，配对拼音
        const py = pinyinSyllables[syllableIndex] || '';
        syllableIndex++;

        return (
          <div key={i} className="inline-flex flex-col items-center">
            <span className={`text-primary-400 ${styles.pinyin} leading-tight`}>{py}</span>
            <span className={`font-heading ${styles.char} text-primary-800 leading-tight`}>
              {char}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default PinyinText;
