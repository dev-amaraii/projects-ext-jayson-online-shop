Feature: Jayson Tech complete client preview journey

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
  And the text "Illustrative total" should exist

@preview @cart
Scenario: Customer can clear the demo cart
  Given I navigate to "/"
  When I wait for testid:storefront-hydrated
  And I click the button "Add Wireless Headphones to cart"
  And I click the button "Clear cart"
  Then I should see the heading "Your Cart (0)"
  And the text "Your cart is empty. Add a product to get started." should exist

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

@preview @navigation
Scenario: Product details are reachable from the catalogue
  Given I navigate to "/"
  When I wait for testid:storefront-hydrated
  And I click the button "View Wireless Headphones"
  Then I should see the heading "Wireless Headphones"
  And the text "Illustrative price" should exist

@preview @wishlist
Scenario: A saved product appears in wishlist
  Given I navigate to "/"
  When I wait for testid:storefront-hydrated
  And I click the button "Save Wireless Headphones to wishlist"
  And I click the button "Open wishlist"
  Then I should see the heading "Saved items"
  And the text "Wireless Headphones" should exist

@preview @checkout
Scenario: Customer can review and create a simulated order
  Given I navigate to "/"
  When I wait for testid:storefront-hydrated
  And I click the button "Add Wireless Headphones to cart"
  And I click the button "Continue to demo checkout"
  And I click the button "Review demo order"
  And I click the button "Place demo order (no payment)"
  Then I should see the heading "Demo order confirmed!"
  And the text "Mock receipt" should exist

@preview @orders
Scenario: Created demo order appears in browser order history
  Given I navigate to "/"
  When I wait for testid:storefront-hydrated
  And I click the button "Add Wireless Headphones to cart"
  And I click the button "Continue to demo checkout"
  And I click the button "Review demo order"
  And I click the button "Place demo order (no payment)"
  And I click the button "View demo orders"
  Then I should see the heading "Demo orders"
  And the text "Wireless Headphones" should exist

@preview @account
Scenario: Demo account links to customer experiences
  Given I navigate to "/"
  When I wait for testid:storefront-hydrated
  And I click the button "Open account"
  Then I should see the heading "My account preview"
  And the text "Demo Customer" should exist
