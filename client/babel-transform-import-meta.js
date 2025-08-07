// Babel plugin to transform import.meta.env to process.env for Jest
module.exports = function () {
  return {
    visitor: {
      MemberExpression(path) {
        if (
          path.node.object &&
          path.node.object.type === "MetaProperty" &&
          path.node.object.meta.name === "import" &&
          path.node.object.property.name === "meta" &&
          path.node.property.name === "env"
        ) {
          // Transform import.meta.env to a mock object
          path.replaceWithSourceString(`{
            VITE_API_URL: 'http://localhost:5000/api',
            VITE_CLOUDINARY_CLOUD_NAME: 'test-cloud',
            VITE_CLOUDINARY_UPLOAD_PRESET: 'test-preset',
            VITE_STRIPE_PUBLISHABLE_KEY: 'pk_test_mock'
          }`);
        }
      },
    },
  };
};
