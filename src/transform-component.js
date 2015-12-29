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

(function(internal, testing) {

  function TransformComponent() {
  }

  TransformComponent._componentFromValueArray = function(type, value) {
    var component = Object.create(type.prototype);
    type.apply(component, value);
    return component;
  };

  TransformComponent.prototype.asMatrix = function() {
    throw new TypeError('Should not be reached.');
  };

  TransformComponent.prototype.is2DComponent = function() {
    return this.asMatrix().is2DComponent();
  };

  internal.TransformComponent = TransformComponent;
  if (TYPED_OM_TESTING) {
    testing.TransformComponent = TransformComponent;
  }

})(typedOM.internal, typedOMTesting);
