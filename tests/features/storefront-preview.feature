Feature: Jayson Tech client preview smoke test

@preview @smoke
Scenario: Customer can discover products by search
  Given I navigate to "/"
  Then I should see the heading "Popular Products"
  When I type "headphones" into the field "Search products"
  Then the text "Wireless Headphones" should exist

@preview @cart
Scenario: Customer can add and clear a demo cart
  Given I navigate to "/"
  When I type "headphones" into the field "Search products"
  And I click the button "Add to Cart"
  Then I should see the heading "Your Cart (1)"
  And the text "Illustrative subtotal" should exist
  When I click the button "Clear cart"
  Then I should see the heading "Your Cart (0)"
  And the text "Checkout coming soon" should exist

@preview @filters
Scenario: Customer can browse a category
  Given I navigate to "/"
  When I click the button "Shop Audio"
  Then the text "Wireless Headphones" should exist

@preview @negative
Scenario: Customer can recover from an empty search
  Given I navigate to "/"
  When I type "nothing-matches-this-demo-product" into the field "Search products"
  Then the text "No matching products. Try a different search or category." should exist
  When I click the button "Clear filters"
  Then the text "Wireless Headphones" should exist
