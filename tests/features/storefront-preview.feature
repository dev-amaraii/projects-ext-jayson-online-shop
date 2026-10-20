Feature: Jayson Tech client preview smoke test

@preview @smoke
Scenario: Search narrows the catalogue
  Given I navigate to "/"
  When I wait for testid:storefront-hydrated
  And I type "headphones" into the field "Search products"
  Then the text "Wireless Headphones" should exist
  And I should not see the text "Smartwatch"

@preview @cart
Scenario: Customer can add a specific product to the demo cart
  Given I navigate to "/"
  When I wait for testid:storefront-hydrated
  And I click the button "Add Wireless Headphones to cart"
  Then I should see the heading "Your Cart (1)"
  And the text "Illustrative subtotal" should exist

@preview @cart
Scenario: Customer can clear their demo cart
  Given I navigate to "/"
  When I wait for testid:storefront-hydrated
  And I click the button "Add Wireless Headphones to cart"
  And I click the button "Clear cart"
  Then I should see the heading "Your Cart (0)"
  And the text "Your cart is empty. Add a product to get started." should exist
  And the text "Checkout coming soon" should exist

@preview @filters
Scenario: Customer can browse a category
  Given I navigate to "/"
  When I wait for testid:storefront-hydrated
  And I click the button "Shop Audio"
  Then the text "Wireless Headphones" should exist
  And I should not see the text "Smartwatch"

@preview @negative
Scenario: Nonexistent search shows an empty state
  Given I navigate to "/"
  When I wait for testid:storefront-hydrated
  And I type "nothing-matches-this-demo-product" into the field "Search products"
  Then the text "No matching products. Try a different search or category." should exist
  And I should not see the text "Wireless Headphones"

@preview @negative
Scenario: Customer can clear an empty search
  Given I navigate to "/"
  When I wait for testid:storefront-hydrated
  And I type "nothing-matches-this-demo-product" into the field "Search products"
  And I wait for the button "Clear filters"
  And I click the button "Clear filters"
  Then the text "Wireless Headphones" should exist
  And I should not see the text "No matching products. Try a different search or category."
