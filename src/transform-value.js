// Copyright 2015 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
//     You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//     See the License for the specific language governing permissions and
// limitations under the License.

(function(internal, scope) {

  function TransformValue(values) {
    if (!Array.isArray(values)) {
      throw new TypeError('TransformValue must be an array of ' +
          'TransformComponents.');
    } else if (values.length < 1) {
      throw new TypeError('TransformValue must have at least 1 ' +
          'TransformComponent.');
    }

    this.transformComponents = [];
    for (var i = 0; i < values.length; i++) {
      if (!(values[i] instanceof TransformComponent)) {
        throw new TypeError('Argument at index ' + i + ' is not an instance ' +
            'of \'TransformComponent\'.');
      }
      this.transformComponents.push(values[i]);
    }

    this._matrix = this._computeMatrix();
    this.cssString = this._generateCssString();
  }
  internal.inherit(TransformValue, internal.StyleValue);

  TransformValue._componentTypesDictionary = {
    matrix3d: {type: Matrix, numberOfArgs: 16, typeOfArgs: NumberValue},
    matrix: {type: Matrix, numberOfArgs: 6, typeOfArgs: NumberValue},
    perspective: {type: Perspective, numberOfArgs: 1, typeOfArgs: LengthValue},
    rotate3d: {type: Rotation, numberOfArgs: 4, typeOfArgs: NumberValue},
    rotate: {type: Rotation, numberOfArgs: 1, typeOfArgs: NumberValue},
    scale3d: {type: Scale, numberOfArgs: 3, typeOfArgs: NumberValue},
    scale: {type: Scale, numberOfArgs: 2, typeOfArgs: NumberValue},
    skew: {type: Skew, numberOfArgs: 2, typeOfArgs: NumberValue},
    translate3d: {type: Translation, numberOfArgs: 3, typeOfArgs: LengthValue},
    translate: {type: Translation, numberOfArgs: 2, typeOfArgs: LengthValue},
  }

  TransformValue.parse = function(cssString) {
    if (typeof cssString != 'string') {
      throw new TypeError('Must parse a length out of a string.');
    }

    cssString = cssString.trim().toLowerCase();

    var componentTypes =  'matrix3d|matrix|perspective|rotate3d|rotate|' +
        'scale3d|scale|skew|translate3d|translate';

    var unitAndInput = cssString.split(
        new RegExp('(' + componentTypes + ')', 'g'));
    unitAndInput.shift();

    if (!unitAndInput || unitAndInput.length % 2) {
      return null;
    }

    var components = [];
    for (var i = 0; i < unitAndInput.length / 2; i++) {
      var type = unitAndInput[2 * i];
      var valueString = unitAndInput[2 * i + 1].trim();
      if (!(new RegExp(componentTypes, 'g')).test(type)) {
        return null;
      }

      switch (type) {
        case 'rotate3d':
        case 'rotate':
          if (!/[0-9]deg\s*\)$/g.test(valueString)) {
            return null;
          }
          valueString = valueString.replace(/deg\s*\)$/g, ')');

        default:
          var componentDefinition =
              TransformValue._componentTypesDictionary[type];
          var value = internal.parsing.parseArgument(
              componentDefinition.numberOfArgs, componentDefinition.typeOfArgs,
              valueString);

          if (!value) {
            return null;
          }

          if (componentDefinition.typeOfArgs == NumberValue) {
            value = value.map(function(number) {return number.value});
          }
          if (componentDefinition.type == Rotation) {
            var angle = value.pop();
            value.unshift(angle);
          }
          components[i] = TransformComponent._componentFromValueArray(
              componentDefinition.type, value);
      }
    }

    return new TransformValue(components);
  };

  TransformValue.prototype.asMatrix = function() {
    return this._matrix;
  };

  TransformValue.prototype.is2D = function() {
    return this.asMatrix().is2DComponent();
  };

  TransformValue.prototype._computeMatrix = function() {
    var matrix = this.transformComponents[0].asMatrix();
    for (var i = 1; i < this.transformComponents.length; ++i) {
      matrix = matrix.multiply(this.transformComponents[i].asMatrix());
    }
    return matrix;
  };

  TransformValue.prototype._generateCssString = function() {
    function getCssString(value) {
      return value.cssString;
    }
    return this.transformComponents.map(getCssString).join(' ');
  };

  scope.TransformValue = TransformValue;

})(typedOM.internal, window);
