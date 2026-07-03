import ImaraLogo from '../components/common/ImaraLogo';
import ImaraLogoAdvanced from '../components/common/ImaraLogoAdvanced';

const LogoPreview = () => {
  const sizes = [24, 32, 48, 64, 96, 128];
  const variants = ['default', 'light', 'dark'];
  const backgrounds = [
    { name: 'White', class: 'bg-white' },
    { name: 'Light Gray', class: 'bg-gray-100' },
    { name: 'Dark Gray', class: 'bg-gray-800' },
    { name: 'Black', class: 'bg-black' },
    { name: 'Teal Gradient', class: 'bg-gradient-to-br from-teal-500 to-teal-700' },
    { name: 'Blue Gradient', class: 'bg-gradient-to-br from-blue-500 to-blue-700' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Imara SACCO Logo Preview
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Preview all logo variations and sizes
          </p>
        </div>

        {/* Simple Logo - Different Sizes */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Simple Logo (ImaraLogo) - All Sizes
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {sizes.map(size => (
              <div key={size} className="text-center">
                <div className="bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl p-6 flex items-center justify-center mb-3">
                  <ImaraLogo size={size} />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{size}px</p>
              </div>
            ))}
          </div>
        </section>

        {/* Advanced Logo - All Variants */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Advanced Logo (ImaraLogoAdvanced) - All Variants
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {variants.map(variant => (
              <div key={variant}>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 capitalize">
                  {variant} Variant
                </h3>
                <div className="space-y-4">
                  {[48, 64, 96].map(size => (
                    <div key={size} className="bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl p-6 flex items-center justify-center">
                      <ImaraLogoAdvanced size={size} variant={variant} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Background Variations */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Logo on Different Backgrounds
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {backgrounds.map(bg => (
              <div key={bg.name}>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  {bg.name}
                </h3>
                <div className={`${bg.class} rounded-xl p-8 flex items-center justify-center`}>
                  <ImaraLogoAdvanced size={64} variant="default" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Usage Examples */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Usage Examples
          </h2>
          
          {/* In Header */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
              In Header/Navbar
            </h3>
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <ImaraLogoAdvanced size={40} variant="light" />
                <span className="text-white font-bold text-xl">Imara SACCO</span>
              </div>
            </div>
          </div>

          {/* In Card */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
              In Card Header
            </h3>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <ImaraLogo size={32} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white">Imara SACCO</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Empowering Community Finance</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Your trusted partner in cooperative savings and credit services.
              </p>
            </div>
          </div>

          {/* Centered Hero */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Hero/Landing Page
            </h3>
            <div className="bg-gradient-to-br from-emerald-900 via-blue-900 to-slate-900 rounded-xl p-12 text-center">
              <ImaraLogoAdvanced size={160} variant="light" className="mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-2">Welcome to Imara SACCO</h2>
              <p className="text-gray-300">Empowering communities through cooperative finance</p>
            </div>
          </div>
        </section>

        {/* Animation Examples */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Animation Examples
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl p-8 flex items-center justify-center mb-3">
                <ImaraLogoAdvanced 
                  size={64} 
                  variant="default"
                  className="transition-transform hover:scale-110 duration-300"
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Hover Scale</p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl p-8 flex items-center justify-center mb-3">
                <ImaraLogoAdvanced 
                  size={64} 
                  variant="default"
                  className="transition-transform hover:rotate-12 duration-500"
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Hover Rotate</p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl p-8 flex items-center justify-center mb-3">
                <ImaraLogoAdvanced 
                  size={64} 
                  variant="default"
                  className="animate-pulse"
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pulse</p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl p-8 flex items-center justify-center mb-3">
                <ImaraLogoAdvanced 
                  size={64} 
                  variant="default"
                  className="hover:opacity-80 transition-opacity duration-300"
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Hover Fade</p>
            </div>
          </div>
        </section>

        {/* Download Instructions */}
        <section className="bg-gradient-to-br from-blue-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            How to Export Logo
          </h2>
          <div className="space-y-3 text-gray-700 dark:text-gray-300">
            <p><strong>As PNG:</strong> Right-click on any logo above → "Save image as" → Choose PNG format</p>
            <p><strong>As SVG:</strong> Open browser DevTools → Copy SVG code from the component files</p>
            <p><strong>High Resolution:</strong> SVG is vector-based, so it scales infinitely without quality loss</p>
            <p><strong>Code Location:</strong> <code className="bg-white dark:bg-gray-900 px-2 py-1 rounded">Frontend/src/components/common/ImaraLogo.jsx</code></p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LogoPreview;
