suite('TransformValue', function() {
  test('TransformValue is a TransformValue and StyleValue', function() {
    var transform = new TransformValue([new Scale(2, -1)]);
    assert.instanceOf(transform, TransformValue,
        'A new TransformValue should be an instance of TransformValue');
    assert.instanceOf(transform, StyleValue,
        'A new TransformValue should be an instance of StyleValue');
  });

  test('TransformValue constructor throws exception for invalid types',
      function() {
    assert.throws(function() {new TransformValue()});
    assert.throws(function() {new TransformValue({})});
    assert.throws(function() {new TransformValue([])});
    assert.throws(function() {new TransformValue(['1', '2'])});
    assert.throws(function() {new TransformValue([null])});
    assert.throws(function() {new TransformValue([new NumberValue(5)])});
  });

  test('TransformValue constructor works with 1 component', function() {
    var transform;
    var scale = new Scale(2, -1);
    var values = [scale];
    assert.doesNotThrow(function() {transform = new TransformValue(values)});
    assert.isTrue(transform.is2D());
    assert.strictEqual(transform.cssString, scale.cssString);
    assert.deepEqual(transform.asMatrix(), scale.asMatrix());
  });

  test('TransformValue constructor works with duplicate component types',
        function() {
    var transform;
    var scale = new Scale(2, -1);
    var values = [scale, scale];
    assert.doesNotThrow(function() {transform = new TransformValue(values)});
    assert.isTrue(transform.is2D());
    assert.strictEqual(transform.cssString,
        scale.cssString + ' ' + scale.cssString);

    var expectedMatrix = scale.asMatrix().multiply(scale.asMatrix());
    var transformMatrix = transform.asMatrix();
    assert.strictEqual(transformMatrix.cssString, expectedMatrix.cssString);
    assert.deepEqual(transformMatrix, expectedMatrix);
  });

  test('TransformValue constructor works with multiple 2D components',
        function() {
    var transform;
    var matrix = new Matrix(1, 2, 3, 4, 5, 6);
    var scale = new Scale(2, -1);
    var values = [matrix, scale];
    assert.doesNotThrow(function() {transform = new TransformValue(values)});
    assert.isTrue(transform.is2D());
    assert.strictEqual(transform.cssString,
        values[0].cssString + ' ' + values[1].cssString);

    var expectedMatrix = values[0].asMatrix().multiply(values[1].asMatrix());
    var transformMatrix = transform.asMatrix();
    assert.strictEqual(transformMatrix.cssString, expectedMatrix.cssString);
    assert.deepEqual(transformMatrix, expectedMatrix);
  });

  test('TransformValue constructor works with multiple 3D components',
        function() {
    var transform;
    var matrix = new Matrix(1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6);
    var scale = new Scale(3, 2, 0.5);
    var values = [matrix, scale];
    assert.doesNotThrow(function() {transform = new TransformValue(values)});
    assert.isFalse(transform.is2D());
    assert.strictEqual(transform.cssString,
        values[0].cssString + ' ' + values[1].cssString);

    var expectedMatrix = values[0].asMatrix().multiply(values[1].asMatrix());
    var transformMatrix = transform.asMatrix();
    assert.strictEqual(transformMatrix.cssString, expectedMatrix.cssString);
    assert.deepEqual(transformMatrix, expectedMatrix);
  });

  function assertTransformComponents(actualTransform, expectedComponents, errorMsg) {
    assert.isNotNull(actualTransform, errorMsg);
    assert.instanceOf(actualTransform, TransformValue, errorMsg);
    var actualComponents = actualTransform.transformComponents;
    assert.strictEqual(actualComponents.length, expectedComponents.length,
        errorMsg + ' Different number of components.');
    for (var i = 0; i < expectedComponents.length; i++) {
      var actual = actualComponents[i];
      var expected = expectedComponents[i];
      assert.instanceOf(actual, TransformComponent, errorMsg);
      assert.strictEqual(actual.cssString, expected.cssString, errorMsg);
      assert.strictEqual(actual.is2DComponent(), expected.is2DComponent(),
          errorMsg);
      assert.deepEqual(actual.asMatrix(), expected.asMatrix(), errorMsg);
      assert.deepEqual(actual, expected, errorMsg);
    }
  }

  test('TransformValue constructor works with multiple 2D and 3D components',
        function() {
    var transform;
    var matrix2d = new Matrix(1, 2, 3, 4, 5, 6);
    var matrix3d = new Matrix(1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6);
    var skew = new Skew(30, 60);
    var scale2d = new Scale(2, -1);
    var scale3d = new Scale(3, 2, 0.5);
    var values = [matrix2d, scale3d, matrix2d, skew, matrix3d, scale2d];
    assert.doesNotThrow(function() {transform = new TransformValue(values)});
    assert.isFalse(transform.is2D());
    assert.strictEqual(transform.cssString,
        values.map(function(value) {return value.cssString}).join(' '));

    var expectedMatrix = values[0].asMatrix();
    for (var i = 1; i < values.length; ++i) {
      expectedMatrix = expectedMatrix.multiply(values[i].asMatrix());
    }

    var transformMatrix = transform.asMatrix();
    assert.strictEqual(transformMatrix.cssString, expectedMatrix.cssString);
    assert.deepEqual(transformMatrix, expectedMatrix);
  });

  test('TransformValue.parse returns expected transformComponents for single ' +
      'component strings', function() {
    var simpleLength = new SimpleLength(1, 'px');
    var values = [
      // Simple components
      {str: 'matrix3d(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15)',
          out: new Matrix(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15)},
      {str: 'matrix(0, 1, 2, 3, 4, 5)', out: new Matrix(0, 1, 2, 3, 4, 5)},
      {str: 'perspective(1px)', out: new Perspective(simpleLength)},
      {str: 'rotate3d(1, 2, 3, 0deg)', out: new Rotation(0, 1, 2, 3)},
      {str: 'rotate(0deg)', out: new Rotation(0)},
      {str: 'scale3d(0, 1, 2)', out: new Scale(0, 1, 2)},
      {str: 'scale(0, 1)', out: new Scale(0, 1)},
      {str: 'skew(0, 0)', out: new Skew(0, 0)},
      {str: 'translate3d(1px, 1px, 1px)',
          out: new Translation(simpleLength, simpleLength, simpleLength)},
      {str: 'translate(1px, 1px)',
          out: new Translation(simpleLength, simpleLength)},

      // No spacing
      {str: 'matrix3d(0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15)',
          out: new Matrix(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15)},
      {str: 'translate3d(1px,1px,1px)',
          out: new Translation(simpleLength, simpleLength, simpleLength)},

      // Extra spacing
      {str: ' matrix(0, 1, 2, 3, 4, 5) \n ', out: new Matrix(0, 1, 2, 3, 4, 5)},
      {str: 'translate( \t 1px, \n 1px \n)',
          out: new Translation(simpleLength, simpleLength)},
    ];

    for (var i = 0; i < values.length; i++) {
      var result = TransformValue.parse(values[i].str);
      var errorMsg = 'Parsing ' + values[i].str + ' did not produce the ' +
          'expected TransformComponent.';
      assertTransformComponents(result, [values[i].out], errorMsg);
    }
  });

  test('TransformValue.parse returns expected transformComponents for ' +
      'compound component strings', function() {
    var simpleLength = new SimpleLength(1, 'px');
    var components = {
      matrix3d: new Matrix(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
      matrix0: new Matrix(0, 1, 2, 3, 4, 5),
      matrix1: new Matrix(1, 1, 1, 1, 1, 1),
      perspective: new Perspective(simpleLength),
      rotate3d: new Rotation(0, 1, 2, 3),
      rotate: new Rotation(0),
      scale0: new Scale(0, 1),
      scale1: new Scale(10, -2),
      skew: new Skew(10, 15),
      translate3d: new Translation(simpleLength, simpleLength, simpleLength),
      translate: new Translation(simpleLength, simpleLength),
    };

    var values = [
      // Repetition of the same type
      {str: 'matrix(0, 1, 2, 3, 4, 5) matrix(1, 1, 1, 1, 1, 1)',
          out: [components.matrix0, components.matrix1]},
      {str: 'scale(0, 1) scale(10, -2)',
          out: [components.scale0, components.scale1]},
      {str: 'scale(0, 1) scale(10, -2) scale(0, 1)',
          out: [components.scale0, components.scale1, components.scale0]},

      // Mixture of 3d and 2d of same type.
      // Must test both 3d before 2d and vice versa.
      {str: 'matrix3d(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15) ' +
          'matrix(0, 1, 2, 3, 4, 5)',
          out: [components.matrix3d, components.matrix0]},
      {str: 'matrix(0, 1, 2, 3, 4, 5) ' +
          'matrix3d(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15)',
          out: [components.matrix0, components.matrix3d]},
      {str: 'rotate3d(1, 2, 3, 0deg) rotate(0deg)',
          out: [components.rotate3d, components.rotate]},
      {str: 'rotate(0deg) rotate3d(1, 2, 3, 0deg)',
          out: [components.rotate, components.rotate3d]},
      {str: 'translate3d(1px, 1px, 1px) translate(1px, 1px)',
          out: [components.translate3d, components.translate]},
      {str: 'translate(1px, 1px) translate3d(1px, 1px, 1px)',
          out: [components.translate, components.translate3d]},

      // Complex mixture of types

      // No spacing
      {str: }

    ];

    for (var i = 0; i < values.length; i++) {
      var result = TransformValue.parse(values[i].str);
      var errorMsg = 'Parsing ' + values[i].str + ' did not produce the ' +
          'expected TransformComponent.';
      assertTransformComponents(result, values[i].out, errorMsg);
    }
  });

  test('TransformValue.parse throws exceptions for invalid input.', function() {
    var values = [
      // Invalid types.
      null, 5, {},
      // Completely invalid strings.
      '', '5px',
      // Invalid number of arguments.
      // Swapping number of arguments between 2d and 3d versions.
      'matrix3d(0, 1, 2, 3, 4, 5)', 'rotate(1, 2, 3, 0deg)'
      // Invalid numbers
      '-3.4e-2.6px',
      // Invalid calc statements.
      'calc()', 'calc(5)', 'calc(50 + 5px)', 'calc(pickles)',
      'calc(5px + 5invalid)', 'calc(5px * 5px)',
      // Invalid or missing units.
      '100', '50somethings'
    ];
    for (var i = 0; i < values.length; i++) {
      assert.throws(function() { LengthValue.parse(values[i]); }, TypeError);
    }
  });
});
