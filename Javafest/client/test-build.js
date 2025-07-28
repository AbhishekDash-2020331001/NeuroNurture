const { execSync } = require('child_process');

try {
  console.log('Testing Tailwind CSS build...');
  const output = execSync('npx tailwindcss -i src/index.css -o test-output.css', { 
    encoding: 'utf8',
    cwd: __dirname 
  });
  console.log('✅ Tailwind CSS build successful!');
  console.log(output);
} catch (error) {
  console.error('❌ Tailwind CSS build failed:');
  console.error(error.message);
  process.exit(1);
}
