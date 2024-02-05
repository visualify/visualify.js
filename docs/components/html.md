# HTML Component

The HTML component is used to display HTML content on the page.

## Properties

The HTML component has the following properties:

-   `type` (string): The type of the component, in this case `HTML`.
-   `id` (string): The unique identifier of the component.
-   `row` (int): The row in which the component is to be displayed.
-   `col` (int): The column in which the component is to be displayed.
-   `colspan` (int): The number of columns the component is to span.
-   `html` (string): The HTML content to be displayed.

## Future Work

We will add the ability to fetch the HTML content from an API.

- `script` (string): The script to be executed.
- `style` (string): The style to be applied.

### Example

```json
{
    "type": "HTML",
    "row": 1,
    "col": 2,
    "colspan": 3,
    "html": "<img style='width: 100%' src='./mainpage.png' alt='Abstract'>"
}
```

