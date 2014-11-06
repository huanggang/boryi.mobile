function get_cat_att_map(categories, map){
  for (var i = 0; i < categories.length; i++){
    var category = categories[i];
    map.Set(String(category.i), category.n);
    if (category.s != null){
      get_cat_att_map(category.s, map);
    }
    if (category.a != null){
      get_cat_att_map(category.a, map);
    }
  }
  return map;
}

function get_categories_by_parent_id(categories, parent_id){
  var sub_cats = new Array();
  if (parent_id == null){
    for (var i = 0; i < categories.length; i++){
      var category = categories[i];
      var sub_cat = new Object();
      sub_cat.i = category.i;
      sub_cat.n = category.n;
      sub_cats.push(sub_cat);
    }
    return sub_cats;
  }

  var grandparent_id = Math.floor(parent_id / 10000.0) * 10000;
  for (var i = 0; i < categories.length; i++){
    var category = categories[i];
    if (category.i == grandparent_id){
      if (grandparent_id == parent_id){
        if (category.s != null){
          var sub_categories = category.s;
          for (var j = 0; j < sub_categories.length; j++){
            var sub_category = sub_categories[j];
            var sub_cat = new Object();
            sub_cat.i = sub_category.i;
            sub_cat.n = sub_category.n;
            sub_cats.push(sub_cat);
          }
        }
      }
      else {
        if (category.s != null){
          var sub_categories = category.s;
          for (var j = 0; j < sub_categories.length; j++){
            var sub_category = sub_categories[j];
            if (sub_category.i == parent_id){
              if (sub_category.s != null){
                var sub_sub_categories = sub_category.s;
                for (var k = 0; k < sub_sub_categories.length; k++){
                  var sub_sub_category = sub_sub_categories[k];
                  var sub_cat = new Object();
                  sub_cat.i = sub_sub_category.i;
                  sub_cat.n = sub_sub_category.n;
                  sub_cats.push(sub_cat);
                }
              }
              break;
            }
          }
        }
      }
      break;
    }
  }
  return sub_cats;
}

function get_attributes_by_category_id(categories, category_id){
  var attributes = new Array();
  var grandparent_id = Math.floor(category_id / 10000.0) * 10000;
  var parent_id = Math.floor(category_id / 100.0) * 100;
  for (var i = 0; i < categories.length; i++){
    var category = categories[i];
    if (category.i == grandparent_id){
      if (category.a != null){
        attributes = attributes.concat(category.a);
      }
      if (grandparent_id == category_id){
      }
      else{
        if (category.s != null){
          var sub_categories = category.s;
          for (var j = 0; j < sub_categories.length; j++){
            var sub_category = sub_categories[j];
            if (sub_category.i == parent_id){
              if (sub_category.a != null){
                attributes = attributes.concat(sub_category.a);
              }
              if (parent_id == category_id){
              }
              else{
                if (sub_category.s != null){
                  var sub_sub_categories = sub_category.s;
                  for (var k = 0; k < sub_sub_categories.length; k++){
                    var sub_sub_category = sub_sub_categories[k];
                    if (sub_sub_category.i == category_id){
                      if (sub_sub_category.a != null){
                        attributes = attributes.concat(sub_sub_category.a);
                      }
                      break;
                    }
                  }
                }
              }
              break;
            }
          }
        }
      }
      break;
    }
  }
  return attributes;
}