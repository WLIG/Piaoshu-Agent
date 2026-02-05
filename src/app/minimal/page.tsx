export default function MinimalPage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)',
      padding: '2rem',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: 'bold', 
            color: '#1f2937',
            marginBottom: '1rem'
          }}>
            🤖 飘叔Agent
          </h1>
          <p style={{ 
            fontSize: '1.25rem', 
            color: '#6b7280',
            lineHeight: '1.6'
          }}>
            多模态智能对话系统 - 最小化版本
          </p>
        </div>

        {/* Chat Interface */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          {/* Chat Header */}
          <div style={{
            background: '#f8fafc',
            padding: '1rem',
            borderBottom: '1px solid #e2e8f0'
          }}>
            <h2 style={{ 
              margin: 0, 
              fontSize: '1.25rem', 
              fontWeight: '600',
              color: '#1f2937'
            }}>
              💬 智能对话
            </h2>
          </div>

          {/* Messages */}
          <div style={{ 
            height: '400px', 
            overflowY: 'auto', 
            padding: '1rem',
            background: '#fafafa'
          }}>
            {/* Welcome Message */}
            <div style={{ 
              display: 'flex', 
              gap: '0.75rem', 
              marginBottom: '1rem'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#4f46e5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                🤖
              </div>
              <div style={{
                background: '#f1f5f9',
                padding: '0.75rem',
                borderRadius: '12px',
                maxWidth: '80%'
              }}>
                <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.5' }}>
                  🎉 欢迎使用飘叔Agent！我是你的智能助手，具备以下能力：
                  <br /><br />
                  🧠 <strong>专业分析</strong> - 商业思维和案例分析<br />
                  🎤 <strong>语音交互</strong> - 语音输入和AI语音回复<br />
                  🖼️ <strong>图像理解</strong> - 智能图片分析<br />
                  📁 <strong>文档处理</strong> - 多格式文档解析<br />
                  💾 <strong>长期记忆</strong> - 跨会话记住你的偏好
                  <br /><br />
                  有什么我可以帮助你的吗？
                </p>
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div style={{ 
            padding: '1rem', 
            borderTop: '1px solid #e2e8f0',
            background: 'white'
          }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="输入你的问题..."
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
              <button
                style={{
                  padding: '0.75rem 1rem',
                  background: '#4f46e5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
                onMouseOver={(e) => e.target.style.background = '#4338ca'}
                onMouseOut={(e) => e.target.style.background = '#4f46e5'}
              >
                发送
              </button>
            </div>
          </div>
        </div>

        {/* Features */}
        <div style={{ 
          marginTop: '2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎤</div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: '600' }}>语音输入</h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
              支持语音转文字功能
            </p>
          </div>

          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🖼️</div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: '600' }}>图片分析</h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
              AI驱动的图像理解
            </p>
          </div>

          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📁</div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: '600' }}>文档处理</h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
              智能文档解析功能
            </p>
          </div>

          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🧠</div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: '600' }}>Skills系统</h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
              专业领域分析能力
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div style={{ 
          marginTop: '3rem', 
          textAlign: 'center',
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <a 
            href="/simple" 
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              background: '#4f46e5',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = '#4338ca'}
            onMouseOut={(e) => e.target.style.background = '#4f46e5'}
          >
            简化版体验
          </a>
          <a 
            href="/complete" 
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              background: 'white',
              color: '#4f46e5',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '500',
              border: '1px solid #4f46e5',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#4f46e5';
              e.target.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'white';
              e.target.style.color = '#4f46e5';
            }}
          >
            完整版体验
          </a>
          <a 
            href="/chat-test" 
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              background: '#6b7280',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = '#4b5563'}
            onMouseOut={(e) => e.target.style.background = '#6b7280'}
          >
            测试版体验
          </a>
        </div>

        {/* Footer */}
        <div style={{ 
          marginTop: '4rem', 
          textAlign: 'center', 
          fontSize: '0.875rem', 
          color: '#9ca3af' 
        }}>
          <p>🚀 飘叔Agent v2.0 - 部署在Vercel云平台</p>
          <p>具备长期记忆、多模态交互、专业分析能力</p>
        </div>
      </div>
    </div>
  );
}