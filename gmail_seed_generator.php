<?php
function generateUniqueIterations($word) {
    $iterations = [];
    $length = strlen($word);

    // Generate all possible combinations
    for ($i = 1; $i < $length; $i++) {
        $prefix = substr($word, 0, $i);
        $suffix = substr($word, $i);
        $prefixIterations = generateUniqueIterations($prefix);
        $suffixIterations = generateUniqueIterations($suffix);

        foreach ($prefixIterations as $prefixIteration) {
            foreach ($suffixIterations as $suffixIteration) {
                $iteration = $prefixIteration . '.' . $suffixIteration;
                if (!in_array($iteration, $iterations)) {
                    $iterations[] = $iteration;
                }
            }
        }
    }

    // Add the original word as an iteration
    if (!in_array($word, $iterations)) {
        $iterations[] = $word;
    }

    return $iterations;
}

// Get user input
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = $_POST['word'];

    // Generate unique iterations
    $result = generateUniqueIterations($input);
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Unique Iterations Generator</title>
</head>
<body>
    <h2>Unique Iterations Generator</h2>
    <form method="post" action="">
        <label for="word">Enter a word:</label>
        <input type="text" name="word" id="word" required>
        <button type="submit">Generate Unique Iterations</button>
    </form>

    <?php if (isset($result)) : ?>
        <h3>Result:</h3>
        <ul>
            <?php foreach ($result as $iteration) : ?>
                <li><?php echo $iteration ; echo "@gmail.com"; ?></li>
            <?php endforeach; ?>
        </ul>
    <?php endif; ?>
</body>
</html>